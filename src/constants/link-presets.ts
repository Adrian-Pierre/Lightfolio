import { LinkPreset, type NavBarLink } from "@/types/config";

export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
	[LinkPreset.Home]: {
		name: "文章",
		url: "/home/",
	},
	[LinkPreset.About]: {
		name: "主页",
		url: "/about/",
	},
	[LinkPreset.Archive]: {
		name: "归档",
		url: "/archive/",
	},
	[LinkPreset.Friends]: {
		name: "友链",
		url: "/friends/",
	},
};
