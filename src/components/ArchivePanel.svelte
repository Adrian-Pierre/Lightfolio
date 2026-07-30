<script lang="ts">
import { onMount } from "svelte";
import { getPostUrlBySlug, url } from "../utils/url-utils";

export let tags: string[];
export let categories: string[];
export let sortedPosts: Post[] = [];

const params = new URLSearchParams(window.location.search);
tags = params.has("tag") ? params.getAll("tag") : [];
categories = params.has("category") ? params.getAll("category") : [];
const uncategorized = params.get("uncategorized");

interface Post {
	slug: string;
	data: {
		title: string;
		tags: string[];
		category?: string;
		published: Date;
	};
}

interface Group {
	year: number;
	posts: Post[];
}

let groups: Group[] = [];

function normalizeValue(value: string | null | undefined) {
	return (value ?? "").trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function formatDate(date: Date) {
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${month}-${day}`;
}

function formatTag(tagList: string[]) {
	return tagList.map((t) => `#${t}`).join(" ");
}

onMount(async () => {
	let filteredPosts: Post[] = sortedPosts;
	const normalizedTags = new Set(tags.map((tag) => normalizeValue(tag)));
	const normalizedCategories = new Set(
		categories.map((category) => normalizeValue(category)),
	);

	if (tags.length > 0) {
		filteredPosts = filteredPosts.filter(
			(post) =>
				Array.isArray(post.data.tags) &&
				post.data.tags.some((tag) => normalizedTags.has(normalizeValue(tag))),
		);
	}

	if (categories.length > 0) {
		filteredPosts = filteredPosts.filter(
			(post) =>
				post.data.category &&
				normalizedCategories.has(normalizeValue(post.data.category)),
		);
	}

	if (uncategorized) {
		filteredPosts = filteredPosts.filter((post) => !post.data.category);
	}

	const grouped = filteredPosts.reduce(
		(acc, post) => {
			const year = post.data.published.getFullYear();
			if (!acc[year]) {
				acc[year] = [];
			}
			acc[year].push(post);
			return acc;
		},
		{} as Record<number, Post[]>,
	);

	const groupedPostsArray = Object.keys(grouped).map((yearStr) => ({
		year: Number.parseInt(yearStr, 10),
		posts: grouped[Number.parseInt(yearStr, 10)],
	}));

	groupedPostsArray.sort((a, b) => b.year - a.year);

	groups = groupedPostsArray;
});
</script>

<div class="card-base px-8 py-6">
    {#if groups.length === 0}
        <div class="archive-empty">
            <div class="archive-empty-dot"></div>
            <h2
                class="archive-empty-title"
                data-lang-zh="暂时没有匹配到文章"
                data-lang-en="No matching posts yet"
            >暂时没有匹配到文章</h2>
            <p
                class="archive-empty-note"
                data-lang-zh="可以清空筛选后再看看全部内容。"
                data-lang-en="Try clearing the filter and browse the full archive."
            >可以清空筛选后再看看全部内容。</p>
            <a
                href={url("/archive/")}
                class="archive-empty-link"
                data-lang-zh="查看全部归档"
                data-lang-en="View full archive"
            >查看全部归档</a>
        </div>
    {:else}
        {#each groups as group}
            <div>
                <div class="flex flex-row w-full items-center h-[3.75rem]">
                    <div class="w-[15%] md:w-[10%] transition text-2xl font-bold text-right text-75">
                        {group.year}
                    </div>
                    <div class="w-[15%] md:w-[10%]">
                        <div
                                class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto
                    -outline-offset-[2px] z-50 outline-3"
                        ></div>
                    </div>
                    <div class="w-[70%] md:w-[80%] transition text-left text-50">
                        {group.posts.length}
                        <span
                            data-lang-zh=" 篇文章"
                            data-lang-en={group.posts.length === 1 ? " post" : " posts"}
                        > 篇文章</span>
                    </div>
                </div>

                {#each group.posts as post}
                    <a
                            href={getPostUrlBySlug(post.slug)}
                            aria-label={post.data.title}
                            class="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
                    >
                        <div class="flex flex-row justify-start items-center h-full">
                            <!-- date -->
                            <div class="w-[15%] md:w-[10%] transition text-sm text-right text-50">
                                {formatDate(post.data.published)}
                            </div>

                            <!-- dot and line -->
                            <div class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center">
                                <div
                                        class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                        bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
                        outline outline-4 z-50
                        outline-[var(--card-bg)]
                        group-hover:outline-[var(--btn-plain-bg-hover)]
                        group-active:outline-[var(--btn-plain-bg-active)]"
                                ></div>
                            </div>

                            <!-- post title -->
                            <div
                                    class="w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold
                        group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                        text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden"
                            >
                                {post.data.title}
                            </div>

                            <!-- tag list -->
                            <div
                                    class="hidden md:block md:w-[15%] text-left text-sm transition
                        whitespace-nowrap overflow-ellipsis overflow-hidden text-30"
                            >
                                {formatTag(post.data.tags)}
                            </div>
                        </div>
                    </a>
                {/each}
            </div>
        {/each}
    {/if}
</div>

<style>
	.archive-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.85rem;
		min-height: 20rem;
		text-align: center;
	}

	.archive-empty-dot {
		width: 0.95rem;
		height: 0.95rem;
		border-radius: 999px;
		background: linear-gradient(135deg, rgba(170, 230, 219, 0.94), rgba(199, 223, 255, 0.9));
		box-shadow: 0 0 0 0.45rem rgba(170, 230, 219, 0.14);
	}

	.archive-empty-title {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--deep-text);
	}

	.archive-empty-note {
		margin: 0;
		max-width: 24rem;
		font-size: 0.96rem;
		line-height: 1.8;
		color: rgba(76, 88, 95, 0.8);
	}

	.archive-empty-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 2.85rem;
		padding: 0 1.15rem;
		border-radius: 999px;
		border: 1px solid var(--line-divider);
		background: var(--btn-regular-bg);
		color: var(--primary);
		font-size: 0.92rem;
		font-weight: 700;
		transition:
			transform var(--page-transition-duration-fast) var(--page-transition-easing),
			background-color var(--page-transition-duration-fast) ease,
			border-color var(--page-transition-duration-fast) ease,
			box-shadow var(--page-transition-duration-fast) ease;
	}

	.archive-empty-link:hover {
		transform: translateY(-2px);
		background: var(--btn-regular-bg-hover);
		border-color: color-mix(in srgb, var(--primary) 24%, transparent);
		box-shadow: 0 14px 28px -22px rgba(24, 51, 56, 0.24);
	}

</style>
