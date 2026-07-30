import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";

const labelCollator = new Intl.Collator(undefined, {
	sensitivity: "base",
});

let rawSortedPostsPromise: Promise<CollectionEntry<"posts">[]> | undefined;
let sortedPostsPromise: Promise<CollectionEntry<"posts">[]> | undefined;
let sortedPostsListPromise: Promise<PostForList[]> | undefined;
let tagListPromise: Promise<Tag[]> | undefined;
let categoryListPromise: Promise<Category[]> | undefined;

function normalizeLabelKey(value: string) {
	return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function getCleanLabel(value: string) {
	return value.trim().replace(/\s+/g, " ");
}

async function loadVisiblePosts(): Promise<CollectionEntry<"posts">[]> {
	rawSortedPostsPromise ??= getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	}).then((posts) =>
		posts.sort(
			(a, b) =>
				new Date(b.data.published).getTime() -
				new Date(a.data.published).getTime(),
		),
	);

	return rawSortedPostsPromise;
}

export async function getSortedPosts(): Promise<CollectionEntry<"posts">[]> {
	sortedPostsPromise ??= loadVisiblePosts().then((sortedPosts) => {
		for (const post of sortedPosts) {
			post.data.prevSlug = "";
			post.data.prevTitle = "";
			post.data.nextSlug = "";
			post.data.nextTitle = "";
		}

		for (let i = 1; i < sortedPosts.length; i++) {
			sortedPosts[i].data.nextSlug = sortedPosts[i - 1].slug;
			sortedPosts[i].data.nextTitle = sortedPosts[i - 1].data.title;
		}
		for (let i = 0; i < sortedPosts.length - 1; i++) {
			sortedPosts[i].data.prevSlug = sortedPosts[i + 1].slug;
			sortedPosts[i].data.prevTitle = sortedPosts[i + 1].data.title;
		}

		return sortedPosts;
	});

	return sortedPostsPromise;
}
export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	sortedPostsListPromise ??= getSortedPosts().then((sortedPosts) =>
		sortedPosts.map((post) => ({
			slug: post.slug,
			data: post.data,
		})),
	);

	return sortedPostsListPromise;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	tagListPromise ??= loadVisiblePosts().then((posts) => {
		const countMap = new Map<string, Tag>();
		for (const post of posts) {
			for (const tag of post.data.tags) {
				const cleanTag = getCleanLabel(tag);
				if (!cleanTag) continue;

				const normalizedTag = normalizeLabelKey(cleanTag);
				const existingTag = countMap.get(normalizedTag);
				if (existingTag) {
					existingTag.count++;
					continue;
				}

				countMap.set(normalizedTag, {
					name: cleanTag,
					count: 1,
				});
			}
		}

		return [...countMap.values()].sort((a, b) =>
			labelCollator.compare(a.name, b.name),
		);
	});

	return tagListPromise;
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	categoryListPromise ??= loadVisiblePosts().then((posts) => {
		const count = new Map<string, Category>();
		for (const post of posts) {
			if (!post.data.category) {
				const uncategorizedLabel = i18n(I18nKey.uncategorized);
				const normalizedUncategorized = normalizeLabelKey(uncategorizedLabel);
				const existingUncategorized = count.get(normalizedUncategorized);
				if (existingUncategorized) {
					existingUncategorized.count++;
					continue;
				}

				count.set(normalizedUncategorized, {
					name: uncategorizedLabel,
					count: 1,
					url: getCategoryUrl(uncategorizedLabel),
				});
				continue;
			}

			const categoryName = getCleanLabel(
				typeof post.data.category === "string"
					? post.data.category
					: String(post.data.category),
			);
			if (!categoryName) continue;

			const normalizedCategoryName = normalizeLabelKey(categoryName);
			const existingCategory = count.get(normalizedCategoryName);
			if (existingCategory) {
				existingCategory.count++;
				continue;
			}

			count.set(normalizedCategoryName, {
				name: categoryName,
				count: 1,
				url: getCategoryUrl(categoryName),
			});
		}

		return [...count.values()].sort((a, b) =>
			labelCollator.compare(a.name, b.name),
		);
	});

	return categoryListPromise;
}
