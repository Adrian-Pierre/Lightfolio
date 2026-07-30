export interface PictureItem {
	title?: string;
	image: string;
	x?: number;
	y?: number;
	width?: number;
	rotate?: number;
	fit?: "cover" | "contain";
	aspectRatio?: string;
}

export const pictures: PictureItem[] = [
	{
		title: "Avatar",
		image: "assets/images/avatar.png",
		fit: "cover",
	},
];
