import { IGetMovieImagesResult } from "../API/IGetImages";
import { IGetMovieDetailResult } from "../API/IGetDetails/IGetMovieDetail";
import { IGetCredits } from "../API/IGetCredits";
import { IGetResult } from "../API/IGetResults";
export type ISliderBtnPos = "left" | "right";
import { Cast } from "../API/IGetCredits";
import { ReviewResults } from "../API/IGetReviews";

export interface IHeroSlider {
	heroMovieImages: IGetMovieImagesResult[];
	heroMovieDetails: IGetMovieDetailResult[];
}

export interface ISlider {
	forCast?: { data: Cast[]; movieId: string };
	forReview?: { data: ReviewResults[]; movieId: string };
	imageData?: IGetMovieImagesResult[] | undefined;
	detailData?: IGetMovieDetailResult[];
	wrapperMargin?: number;
	sliderType: string;
	inBigMovie: boolean;
	offset?: number;
}

export interface IPopularSlider {
	imageData: IGetMovieImagesResult[] | undefined;
	detailData: IGetResult;
	wrapperMargin?: number;
}
