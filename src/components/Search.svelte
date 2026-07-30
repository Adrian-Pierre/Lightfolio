<script lang="ts">
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils.ts";
import { onMount } from "svelte";
import type { SearchResult } from "@/global";

let keywordDesktop = "";
let keywordMobile = "";
let result: SearchResult[] = [];
let isSearching = false;
let pagefindLoaded = false;
let initialized = false;
let desktopInput: HTMLInputElement | null = null;
let mobileInput: HTMLInputElement | null = null;
let desktopSearchTimer: number | null = null;
let mobileSearchTimer: number | null = null;
let previousKeywordDesktop = "";
let previousKeywordMobile = "";

const fakeResult: SearchResult[] = [
	{
		url: url("/home/"),
		meta: {
			title: "This Is a Fake Search Result",
		},
		excerpt:
			"Because the search cannot work in the <mark>dev</mark> environment.",
	},
	{
		url: url("/home/"),
		meta: {
			title: "If You Want to Test the Search",
		},
		excerpt: "Try running <mark>npm build && npm preview</mark> instead.",
	},
];

const togglePanel = () => {
	const panel = document.getElementById("search-panel");
	panel?.classList.toggle("float-panel-closed");
	if (panel && !panel.classList.contains("float-panel-closed")) {
		requestAnimationFrame(() => mobileInput?.focus());
	}
};

const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
	const panel = document.getElementById("search-panel");
	if (!panel || !isDesktop) return;

	if (show) {
		panel.classList.remove("float-panel-closed");
	} else {
		panel.classList.add("float-panel-closed");
	}
};

const clearSearchTimer = (isDesktop: boolean) => {
	const timer = isDesktop ? desktopSearchTimer : mobileSearchTimer;
	if (timer !== null) {
		window.clearTimeout(timer);
	}

	if (isDesktop) {
		desktopSearchTimer = null;
	} else {
		mobileSearchTimer = null;
	}
};

const queueSearch = (keyword: string, isDesktop: boolean) => {
	clearSearchTimer(isDesktop);
	const timer = window.setTimeout(() => {
		void search(keyword, isDesktop);
	}, 120);

	if (isDesktop) {
		desktopSearchTimer = timer;
	} else {
		mobileSearchTimer = timer;
	}
};

const search = async (keyword: string, isDesktop: boolean): Promise<void> => {
	if (!keyword) {
		setPanelVisibility(false, isDesktop);
		result = [];
		return;
	}

	if (!initialized) {
		return;
	}

	isSearching = true;

	try {
		let searchResults: SearchResult[] = [];

		if (import.meta.env.PROD && pagefindLoaded && window.pagefind) {
			const response = await window.pagefind.search(keyword);
			searchResults = await Promise.all(
				response.results.map((item) => item.data()),
			);
		} else if (import.meta.env.DEV) {
			searchResults = fakeResult;
		} else {
			searchResults = [];
			console.error("Pagefind is not available in production environment.");
		}

		result = searchResults;
		setPanelVisibility(true, isDesktop);
	} catch (error) {
		console.error("Search error:", error);
		result = [];
		setPanelVisibility(Boolean(keyword.trim()), isDesktop);
	} finally {
		isSearching = false;
	}
};

onMount(() => {
	const onPagefindReady = () => {
		initializeSearch();
	};

	const onPagefindError = () => {
		console.warn(
			"Pagefind load error event received. Search functionality will be limited.",
		);
		initializeSearch();
	};

	const handleKeyboardShortcut = (event: KeyboardEvent) => {
		const target = event.target;
		const isTypingField =
			target instanceof HTMLInputElement ||
			target instanceof HTMLTextAreaElement ||
			(target instanceof HTMLElement && target.isContentEditable);

		if (
			event.key === "/" &&
			!event.metaKey &&
			!event.ctrlKey &&
			!event.altKey &&
			!isTypingField
		) {
			event.preventDefault();
			const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
			if (isDesktop) {
				desktopInput?.focus();
				desktopInput?.select();
				if (keywordDesktop.trim()) {
					setPanelVisibility(true, true);
				}
				return;
			}

			document
				.getElementById("search-panel")
				?.classList.remove("float-panel-closed");
			mobileInput?.focus();
			mobileInput?.select();
		}

		if (event.key === "Escape") {
			setPanelVisibility(false, true);
			document
				.getElementById("search-panel")
				?.classList.add("float-panel-closed");
			desktopInput?.blur();
			mobileInput?.blur();
		}
	};

	const initializeSearch = () => {
		initialized = true;
		pagefindLoaded =
			typeof window !== "undefined" &&
			!!window.pagefind &&
			typeof window.pagefind.search === "function";
		if (keywordDesktop) void search(keywordDesktop, true);
		if (keywordMobile) void search(keywordMobile, false);
	};

	if (import.meta.env.DEV) {
		initializeSearch();
	} else {
		document.addEventListener("pagefindready", onPagefindReady);
		document.addEventListener("pagefindloaderror", onPagefindError);

		// Fallback in case events are not caught or pagefind is already loaded by the time this script runs
		setTimeout(() => {
			if (!initialized) {
				initializeSearch();
			}
		}, 2000); // Adjust timeout as needed
	}

	window.addEventListener("keydown", handleKeyboardShortcut);

	return () => {
		document.removeEventListener("pagefindready", onPagefindReady);
		document.removeEventListener("pagefindloaderror", onPagefindError);
		window.removeEventListener("keydown", handleKeyboardShortcut);
		clearSearchTimer(true);
		clearSearchTimer(false);
	};
});

$: if (initialized && keywordDesktop !== previousKeywordDesktop) {
	previousKeywordDesktop = keywordDesktop;
	queueSearch(keywordDesktop, true);
}

$: if (initialized && keywordMobile !== previousKeywordMobile) {
	previousKeywordMobile = keywordMobile;
	queueSearch(keywordMobile, false);
}
</script>

<!-- search bar for desktop view -->
<div id="search-bar" class="relative hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
">
    <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30"></Icon>
    <input
           placeholder="搜索"
           data-lang-placeholder-zh="搜索"
           data-lang-placeholder-en="Search"
           bind:value={keywordDesktop} on:focus={() => search(keywordDesktop, true)}
           bind:this={desktopInput}
           class="transition-all pl-10 text-sm bg-transparent outline-0
         h-full w-40 pr-10 active:w-60 focus:w-60 text-black/50"
    >
    <span class="search-shortcut" aria-hidden="true">/</span>
</div>

<!-- toggle btn for phone/tablet view -->
<button
        on:click={togglePanel}
        aria-label="搜索面板"
        data-lang-aria-label-zh="搜索面板"
        data-lang-aria-label-en="Search panel"
        id="search-switch"
        class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90">
    <Icon icon="material-symbols:search" class="text-[1.25rem]"></Icon>
</button>

<!-- search panel -->
<div id="search-panel" class="float-panel float-panel-closed search-panel absolute md:w-[30rem]
top-[4.9rem] sm:top-20 left-2 sm:left-4 md:left-[unset] right-2 sm:right-4 shadow-2xl rounded-2xl p-2">

    <!-- search bar inside panel for phone/tablet -->
    <div id="search-bar-inside" class="flex relative lg:hidden transition-all items-center h-11 rounded-xl
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
  ">
        <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30"></Icon>
        <input
               placeholder="搜索"
               data-lang-placeholder-zh="搜索"
               data-lang-placeholder-en="Search"
               bind:value={keywordMobile}
               bind:this={mobileInput}
               class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
               focus:w-60 text-black/50"
        >
    </div>

    <!-- search results -->
    {#each result as item}
        <a href={item.url}
           class="transition first-of-type:mt-2 lg:first-of-type:mt-0 group block
       rounded-xl text-base sm:text-lg px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]">
            <div class="transition text-90 inline-flex max-w-full font-bold group-hover:text-[var(--primary)]">
                {item.meta.title}<Icon icon="fa6-solid:chevron-right" class="transition text-[0.75rem] translate-x-1 my-auto text-[var(--primary)]"></Icon>
            </div>
            <div class="transition text-sm text-50">
                {@html item.excerpt}
            </div>
        </a>
    {/each}

    {#if isSearching}
        <div
            class="search-state"
            data-lang-zh="正在搜索…"
            data-lang-en="Searching..."
        >正在搜索…</div>
    {:else if (keywordDesktop || keywordMobile).trim() && result.length === 0}
        <div class="search-state">
            <div
                class="search-state-title"
                data-lang-zh="没有找到匹配结果"
                data-lang-en="No matching results"
            >没有找到匹配结果</div>
            <div
                data-lang-zh="可以换个关键词再试试。"
                data-lang-en="Try a different keyword."
            >可以换个关键词再试试。</div>
        </div>
    {/if}
</div>

<style>
  input:focus {
    outline: 0;
  }
  .search-panel {
    max-height: min(32rem, calc(100vh - 6rem));
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .search-panel a > div:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .search-shortcut {
    position: absolute;
    right: 0.7rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.45rem;
    height: 1.45rem;
    padding: 0 0.3rem;
    border: 1px solid var(--line-divider);
    border-radius: 0.55rem;
    background: rgba(255, 255, 255, 0.58);
    color: var(--primary);
    font-size: 0.74rem;
    font-weight: 700;
    line-height: 1;
  }

  .search-state {
    margin-top: 0.55rem;
    padding: 0.95rem 0.9rem;
    border: 1px dashed var(--line-divider);
    border-radius: 0.95rem;
    color: var(--deep-text);
    font-size: 0.9rem;
    line-height: 1.7;
    text-align: center;
    background: rgba(255, 255, 255, 0.34);
  }

  .search-state-title {
    font-size: 0.96rem;
    font-weight: 700;
    margin-bottom: 0.2rem;
  }

</style>
