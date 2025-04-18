export interface GalleryImage {
    path: string;
    width: number;
    height: number;
};

export interface GenerationResponse {
    images: string[];
    parameters: Record<string, string>;
    info: string;
}