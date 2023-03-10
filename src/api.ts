import { useQuery } from "react-query";
import { IGetMovieDetailResult } from "./Interfaces/API/IGetDetails/IGetMovieDetail";
import { IGetMovieImagesResult } from "./Interfaces/API/IGetImages";
import { IGetResult } from "./Interfaces/API/IGetResults";
import { MediaType } from "./Interfaces/API/IGetSearchResults";
import {
	API_KEY,
	BASE_PATH,
	Endpoint,
	IFavMovie,
	IGenreIdResult,
	QueryMediaType,
} from "./utils/consts";

interface IFetchData {
	endpoint: string;
	mediaType?: string;
	id?: number;
	originalLanguage?: string;
	seasonNum?: number;
	genre?: string;
	originalCountry?: string;
	people?: string;
	query?: string;
}

export function fetchData({
	endpoint,
	mediaType,
	id,
	originalLanguage,
	seasonNum,
	genre,
	originalCountry,
	people,
	query,
}: IFetchData) {
	let url = `${BASE_PATH}`;
	if (endpoint === Endpoint.discover) {
		url += `${endpoint}/${mediaType}`;
	} else {
		url += `/${mediaType}`;
	}

	let language = "en";
	let country = "en";
	let defaultSeasonNum = 1;

	if (id) {
		url += `/${id}`;
	}
	if (originalLanguage) {
		language = originalLanguage;
	}
	if (originalCountry) {
		country = originalCountry;
	}
	if (seasonNum) {
		defaultSeasonNum = seasonNum;
	}

	if (endpoint.includes("{season_num}")) {
		endpoint = endpoint.replace("{season_num}", defaultSeasonNum + "");
	}
	if (endpoint !== Endpoint.discover) {
		url += `${endpoint}`;
	}
	url += `?api_key=${API_KEY}&language=en`;
	if (endpoint === "/images") {
		url += `&include_image_language=en,null`;
	}
	if ((mediaType === "tv" && !id) || originalLanguage) {
		url += `&with_original_language=${language}`;
	}
	if (genre) {
		url += `&with_genres=${genre}`;
	}
	if (people) {
		url += `&with_people=${people}`;
	}
	if (genre || people) {
		url += `&sort_by=popularity.desc&include_adult=${false}`;
	}
	if (endpoint === Endpoint.search && query) {
		url += `&query=${query.replace(" ", "%20")}`;
	}

	console.log("api url", endpoint, url);
	return fetch(url).then((response) => response.json());
}

interface IGetDetails {
	mediaList: IGetResult | IFavMovie | undefined;
	endpoint: string;
	mediaType: QueryMediaType.movie | QueryMediaType.tv | undefined;
	enabled?: IGetResult;
}

export const useGetDetails = ({
	endpoint,
	mediaList,
	mediaType,
}: IGetDetails) => {
	const { data, isLoading } = useQuery<IGetMovieDetailResult[]>(
		[endpoint, mediaType, "details"],
		async () => {
			if (!mediaList) {
				return [];
			}
			const promises =
				mediaList &&
				mediaList?.results.map((media) =>
					fetchData({
						endpoint: Endpoint.details,
						mediaType,
						id: media.id,
						originalLanguage: media.original_language,
					})
				);
			return Promise.all(promises);
		}
	);
	return { data, isLoading };
};

export const useGetImages = ({
	endpoint,
	mediaList,
	mediaType,
}: IGetDetails) => {
	const { data, isLoading } = useQuery<IGetMovieImagesResult[]>(
		[endpoint, mediaType, "images"],
		async () => {
			if (!mediaList) {
				return [];
			}
			const promises =
				mediaList &&
				mediaList?.results.map((media) =>
					fetchData({
						endpoint: Endpoint.images,
						mediaType,
						id: media.id,
						originalLanguage: media.original_language,
					})
				);
			return Promise.all(promises);
		}
	);
	return { data, isLoading };
};

export const useGetMedia = ({
	endpoint,
	mediaType,
	id,
	originalLanguage,
	seasonNum,
	genre,
	originalCountry,
	people,
}: IFetchData) => {
	const type = mediaType ?? "movie or tv";
	const { data: mediaList } = useQuery<IGetResult>(
		[
			endpoint,
			mediaType,
			id,
			originalLanguage,
			seasonNum,
			genre,
			originalCountry,
			people,
			"data",
		],
		() =>
			fetchData({
				endpoint,
				mediaType,
				id,
				originalLanguage,
				seasonNum,
				genre,
				originalCountry,
				people,
			})
	);
	console.log(endpoint, "mediaList", mediaList);

	const { data: mediaDetails, isLoading: mediaDetailsLoading } = useQuery<
		IGetMovieDetailResult[]
	>(
		[
			endpoint,
			mediaType,
			id,
			originalLanguage,
			seasonNum,
			genre,
			originalCountry,
			people,
			"details",
		],
		async () => {
			if (!mediaList) {
				return [];
			}
			const promises =
				mediaList &&
				mediaList?.results.map((media) =>
					fetchData({
						endpoint: Endpoint.details,
						mediaType,
						id: media.id,
						originalLanguage: media.original_language,
					})
				);
			return Promise.all(promises);
		},
		{
			enabled: !!mediaList,
		}
	);

	const { data: mediaImages, isLoading: mediaImagesLoading } = useQuery<
		IGetMovieImagesResult[]
	>(
		[
			endpoint,
			mediaType,
			id,
			originalLanguage,
			seasonNum,
			genre,
			originalCountry,
			people,
			,
			"images",
		],
		async () => {
			if (!mediaList) {
				return [];
			}
			const promises =
				mediaList &&
				mediaList?.results.map((media) =>
					fetchData({
						endpoint: Endpoint.images,
						mediaType,
						id: media.id,
						originalLanguage: media.original_language,
					})
				);
			return Promise.all(promises);
		},
		{
			enabled: !!mediaList,
		}
	);
	const isMediaLoading = mediaDetailsLoading || mediaImagesLoading;

	return {
		mediaList,
		mediaDetails,
		mediaImages,
		isMediaLoading,
	};
};

export function getSearchResults(query: string) {
	return fetch(
		`${BASE_PATH}/search/multi?api_key=${API_KEY}&query=${query}`
	).then((response) => response.json());
}

export function getGenreIdList(mediaType: string) {
	return fetch(`${BASE_PATH}/genre/${mediaType}/list?api_key=${API_KEY}`).then(
		(response) => response.json()
	);
}

export const useGetGenreIdList = () => {
	const { data: movieGenreIdList } = useQuery<IGenreIdResult>(
		["movie", "genreIDs"],
		() => getGenreIdList("movie")
	);
	const { data: tvGenreIdList } = useQuery<IGenreIdResult>(
		["tv", "genreIDs"],
		() => getGenreIdList("tv")
	);
	return { movieGenreIdList, tvGenreIdList };
};
