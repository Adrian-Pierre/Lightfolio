<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

type Props = {
	src: string;
	title: string;
	artist?: string;
	volume?: number;
	loop?: boolean;
};

let { src, title, artist = "", volume = 0.42, loop = true }: Props = $props();

let audioElement: HTMLAudioElement | null = null;
let isPlaying = $state(false);
let isLoading = $state(false);
let hasError = $state(false);
let isFooterVisible = $state(false);

function normalizeVolume(value: number) {
	if (!Number.isFinite(value)) return 0.42;
	return Math.min(1, Math.max(0, value));
}

onMount(() => {
	const audio = audioElement;
	if (!audio) return;

	audio.volume = normalizeVolume(volume);

	const handlePlay = () => {
		isPlaying = true;
		isLoading = false;
		hasError = false;
	};
	const handlePause = () => {
		isPlaying = false;
		isLoading = false;
	};
	const handleWaiting = () => {
		isLoading = true;
	};
	const handleCanPlay = () => {
		isLoading = false;
	};
	const handleError = () => {
		hasError = true;
		isPlaying = false;
		isLoading = false;
	};

	audio.addEventListener("play", handlePlay);
	audio.addEventListener("playing", handlePlay);
	audio.addEventListener("pause", handlePause);
	audio.addEventListener("ended", handlePause);
	audio.addEventListener("waiting", handleWaiting);
	audio.addEventListener("canplay", handleCanPlay);
	audio.addEventListener("error", handleError);

	return () => {
		audio.removeEventListener("play", handlePlay);
		audio.removeEventListener("playing", handlePlay);
		audio.removeEventListener("pause", handlePause);
		audio.removeEventListener("ended", handlePause);
		audio.removeEventListener("waiting", handleWaiting);
		audio.removeEventListener("canplay", handleCanPlay);
		audio.removeEventListener("error", handleError);
	};
});

onMount(() => {
	const footer = document.querySelector(".footer, .footer-card");
	if (!footer || !("IntersectionObserver" in window)) return;

	const observer = new IntersectionObserver(
		([entry]) => {
			isFooterVisible = entry.isIntersecting;
		},
		{
			root: null,
			threshold: 0.08,
		},
	);

	observer.observe(footer);

	return () => {
		observer.disconnect();
	};
});

async function togglePlayback() {
	if (!audioElement || hasError) return;

	if (audioElement.paused) {
		isLoading = true;
		try {
			await audioElement.play();
		} catch {
			isPlaying = false;
			isLoading = false;
		}
		return;
	}

	audioElement.pause();
}
</script>

<div
	class="music-player card-base"
	class:music-player-playing={isPlaying}
	class:music-player-error={hasError}
	class:music-player-compact={isFooterVisible}
	data-music-player
>
	<audio bind:this={audioElement} preload="metadata" src={src} loop={loop}></audio>

	<button
		class="music-player-button btn-plain scale-animation"
		type="button"
		aria-label={isPlaying ? "暂停背景音乐" : "播放背景音乐"}
		aria-pressed={isPlaying}
		disabled={hasError}
		onclick={togglePlayback}
	>
		{#if isLoading}
			<span class="music-player-spinner">
				<Icon icon="material-symbols:progress-activity-rounded"></Icon>
			</span>
		{:else if isPlaying}
			<Icon icon="material-symbols:pause-rounded"></Icon>
		{:else}
			<Icon icon="material-symbols:play-arrow-rounded"></Icon>
		{/if}
	</button>

	<div class="music-player-copy">
		<div class="music-player-kicker">体温电台</div>
		<div class="music-player-title">{hasError ? "音频加载失败" : title}</div>
		{#if artist && !hasError}
			<div class="music-player-artist">{artist}</div>
		{/if}
	</div>
</div>

<style>
.music-player {
	position: fixed;
	right: clamp(1rem, 2vw, 1.5rem);
	bottom: calc(1rem + env(safe-area-inset-bottom));
	z-index: 60;
	display: flex;
	align-items: center;
	gap: 0.75rem;
	width: min(21rem, calc(100vw - 2rem));
	min-height: 4rem;
	overflow: visible;
	padding: 0.55rem 0.85rem 0.55rem 0.55rem;
	border-color: rgba(125, 191, 175, 0.36);
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 252, 252, 0.78)),
		var(--card-bg);
	box-shadow:
		0 22px 48px -24px rgba(54, 72, 82, 0.42),
		0 8px 22px -18px rgba(69, 98, 102, 0.34),
		inset 0 1px 0 rgba(255, 255, 255, 0.82);
	transition:
		width var(--page-transition-duration) var(--page-transition-easing),
		min-height var(--page-transition-duration) var(--page-transition-easing),
		padding var(--page-transition-duration) var(--page-transition-easing),
		background-color var(--page-transition-duration) var(--page-transition-easing),
		border-color var(--page-transition-duration) var(--page-transition-easing),
		box-shadow var(--page-transition-duration) var(--page-transition-easing);
}

.music-player-compact {
	justify-content: center;
	gap: 0;
	width: 3.9rem;
	min-height: 3.9rem;
	padding: 0.5rem;
	border-radius: 999px;
}

.music-player-compact .music-player-copy {
	display: none;
}

.music-player-button {
	width: 2.85rem;
	height: 2.85rem;
	flex: 0 0 auto;
	border-radius: 999px;
	color: var(--primary);
	font-size: 1.75rem;
}

.music-player-button:disabled {
	cursor: not-allowed;
	opacity: 0.5;
}

.music-player-copy {
	min-width: 0;
	line-height: 1.2;
	opacity: 1;
	transition:
		opacity var(--page-transition-duration-fast) ease,
		width var(--page-transition-duration) var(--page-transition-easing);
}

.music-player-kicker {
	margin-bottom: 0.1rem;
	color: var(--primary);
	font-size: 0.68rem;
	font-weight: 700;
	letter-spacing: 0.08em;
}

.music-player-title,
.music-player-artist {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.music-player-title {
	color: var(--deep-text);
	font-size: 0.9rem;
	font-weight: 700;
}

.music-player-artist {
	margin-top: 0.12rem;
	color: color-mix(in srgb, var(--deep-text) 52%, transparent);
	font-size: 0.74rem;
	font-weight: 600;
}

.music-player-spinner {
	display: flex;
	align-items: center;
	justify-content: center;
	animation: music-player-spin 0.9s linear infinite;
}

@keyframes music-player-spin {
	to {
		transform: rotate(360deg);
	}
}

@media (max-width: 640px) {
	.music-player {
		right: 0.75rem;
		bottom: calc(0.75rem + env(safe-area-inset-bottom));
		width: 3.25rem;
		min-height: 3.25rem;
		padding: 0.38rem;
		border-radius: 999px;
		justify-content: center;
		gap: 0;
	}

	.music-player-button {
		width: 2.45rem;
		height: 2.45rem;
		font-size: 1.48rem;
	}

	.music-player-copy {
		display: none;
	}
}
</style>
