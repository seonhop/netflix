import styled from "styled-components";
import { useQuery } from "react-query";
import { getMovies, getMovieDetail, getImages } from "../api";
import { IGetMoviesResult } from "../Interfaces/API/IGetMovies";
import { IGetImagesResult } from "../Interfaces/API/IGetImages";
import { makeImagePath } from "../utils";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useState } from "react";
import { IGetMovieDetailResult } from "../Interfaces/API/IGetMovieDetail";
import { favMovieIDs, favMovieDict } from "../favMovies";
import {
	Outlet,
	useNavigate,
	useMatch,
	PathMatch,
	useOutletContext,
} from "react-router-dom";

const Container = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 200vh;
	overflow-x: hidden;
`;

const Span = styled.span`
	display: block;
	padding: 200px;
`;

const Loader = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 20vh;
`;

const Hero = styled.div<{ bgPhoto: string }>`
	display: flex;
	height: 100vh;
	width: 100%;
	justify-content: center;
	align-items: flex-start;
	flex-direction: column;
	padding: 0 3.5rem;
	gap: 2rem;

	background-image: linear-gradient(to right, #000, rgba(0, 0, 0, 0), #000),
		linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4)),
		url(${(props) => props.bgPhoto});
	background-size: cover;
`;

const HeroTitleContainer = styled.div`
	width: 20%;
`;

const HeroTitle = styled.img`
	max-width: 100%;
	max-height: 100%;
`;

const HeroInfoContainer = styled.div`
	display: flex;
`;

const HeroOverview = styled.p`
	font-size: 1.1rem;
	width: 35%;
	line-height: 1.25;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 4;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const Slider = styled.div<{ margin: number }>`
	position: relative;
	top: ${(props) => props.margin}px;
`;

const Row = styled(motion.div)`
	display: grid;
	gap: 0.5rem;
	grid-template-columns: repeat(6, 1fr);
	position: absolute;
	width: 100%;
	padding: 0 3.5rem;
`;

const rowVariants = {
	hidden: {
		x: `calc(${window.outerWidth}px + 0.5rem)`,
	},
	visible: {
		x: 0,
	},
	exit: {
		x: `calc(-${window.outerWidth}px - 0.5rem)`,
	},
};

const Box = styled(motion.div)`
	height: 150px;
	display: flex;
	flex-direction: column;
	gap: 0;
	:first-child {
		transform-origin: center left;
	}
	:last-child {
		transform-origin: center right;
	}
	:hover {
		cursor: pointer;
	}
`;

const boxVariants = {
	normal: {
		scale: 1,
		transitionEnd: { zIndex: 1 },
		zIndex: 1,
	},
	hover: {
		zIndex: 2,
		scale: 1.3,
		y: -80,
		transition: {
			delay: 0.5,
			duration: 0.1,
			type: "tween",
		},
	},
};

const BoxImgContainer = styled(motion.div)<{
	bgphoto?: string;
	pos: (string | number)[];
	transform: (string | number)[];
	logowidth: string;
}>`
	position: relative;
	background-size: cover;
	background-position: center center;

	> img:first-child {
		max-width: 100%;
		max-height: 100%;
	}
	> img:last-child {
		position: absolute;
		top: ${(props) => props.pos[0]}l;
		right: ${(props) => props.pos[1]};
		bottom: ${(props) => props.pos[2]};
		left: ${(props) => props.pos[3]};
		width: ${(props) => props.logowidth};
		transform: translate(
			${(props) => props.transform[0]},
			${(props) => props.transform[1]}
		);
	}
`;

const Info = styled(motion.div)`
	padding: 10px;
	background-color: ${(props) => props.theme.black.lighter};
	opacity: 0;
	width: 100%;
	h4 {
		text-align: center;
		font-size: 18px;
	}
`;

const infoVariants = {
	hover: {
		opacity: 1,
		transition: {
			delay: 0.5,
			duaration: 0.1,
			type: "tween",
		},
	},
};

const SPIDERMAN_ID = 324857;

function Home() {
	const navigate = useNavigate();
	const moviePathMatch: PathMatch<string> | null = useMatch("/movies/:movieId");
	const { scrollY } = useScroll();

	const { data: getMoviesResult, isLoading } = useQuery<IGetMoviesResult>(
		["movies", "nowPlaying"],
		getMovies
	);
	const { data: spidermanResult } = useQuery<IGetMovieDetailResult>(
		["movies", "spiderman-into-the-spiderverse"],
		() => getMovieDetail(SPIDERMAN_ID)
	);

	/* 	
	const { data: heroMovieImages, isLoading: isImagesLoading } =
		useQuery<IGetImagesResult>(
			["images", "highestRatingMovie"],
			() => getImages(SPIDERMAN_ID),
			{
				enabled: !!getMoviesResult?.results, // Only run if getMoviesResult has data
			}
	); 
	*/
	const { data: heroMovieImages, isLoading: isImagesLoading } =
		useQuery<IGetImagesResult>(["images", "highestRatingMovie"], () =>
			getImages(SPIDERMAN_ID)
		);

	const [index, setIndex] = useState(0);
	const [leaving, setLeaving] = useState(false);
	const increaseIndex = () => {
		if (getMoviesResult) {
			if (leaving) return;
			toggleLeaving();
			const totalMovies = favMovieIDs.length;
			const maxIndex = Math.floor(totalMovies / offset) - 1;
			setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
		}
	};
	const toggleLeaving = () => {
		setLeaving((prev) => !prev);
	};

	const margin = -window.innerHeight * 0.15;
	const offset = 6;
	console.log(index);
	const { data: favMovieImages } = useQuery<IGetImagesResult[]>(
		["favMovieImages", favMovieIDs],
		async () => {
			const promises = favMovieIDs.map((favmovie) => getImages(favmovie.id));
			return Promise.all(promises);
		}
	);
	const { data: favMovieDetailResult } = useQuery<IGetMovieDetailResult[]>(
		["favMovieDetailResult", favMovieIDs],
		async () => {
			const promises = favMovieIDs.map((favmovie) =>
				getMovieDetail(favmovie.id)
			);
			return Promise.all(promises);
		}
	);
	console.log(favMovieImages);
	console.log(favMovieDetailResult);
	const favMovieDetailDict = favMovieDetailResult?.reduce((acc, movie) => {
		acc[+movie.id] = movie;
		return acc;
	}, {} as { [key: string]: IGetMovieDetailResult });

	const onBoxClicked = (movieId: string) => {
		navigate(`/movies/${movieId}`);
	};

	return (
		<Container>
			{isLoading ? (
				<Loader />
			) : (
				<>
					<Hero
						onClick={increaseIndex}
						bgPhoto={makeImagePath(
							heroMovieImages?.backdrops[0].file_path || ""
						)}
					>
						<HeroTitleContainer>
							<HeroTitle
								src={makeImagePath(heroMovieImages?.logos[0].file_path || "")}
							/>
						</HeroTitleContainer>
					</Hero>
					<Slider margin={margin}>
						<AnimatePresence initial={false} onExitComplete={toggleLeaving}>
							<Row
								variants={rowVariants}
								initial="hidden"
								animate="visible"
								exit="exit"
								key={index}
								transition={{ type: "tween", duration: 1 }}
							>
								{favMovieImages
									?.slice(offset * index, offset * index + offset)
									.map((movie) => (
										<Box
											variants={boxVariants}
											initial="normal"
											whileHover="hover"
											transition={{ type: "tween" }}
											key={movie.id}
											onClick={() => onBoxClicked(movie.id + "")}
										>
											<BoxImgContainer
												pos={favMovieDict[String(movie.id)].pos}
												transform={favMovieDict[String(movie.id)].transform}
												logowidth={favMovieDict[String(movie.id)].logoWidth}
											>
												<img
													src={makeImagePath(
														movie.backdrops[0].file_path ||
															movie.posters[0].file_path,
														"w500"
													)}
												/>
												{movie.logos[0].file_path ? (
													<img
														src={makeImagePath(
															movie.logos[0].file_path,
															"w500"
														)}
													/>
												) : (
													<h1>{favMovieDict[String(movie.id)].title}</h1>
												)}
											</BoxImgContainer>
											<Info variants={infoVariants}>
												<h4>{favMovieDict[String(movie.id)].title}</h4>
											</Info>
										</Box>
									))}
							</Row>
						</AnimatePresence>
					</Slider>
				</>
			)}
			<Outlet context={{ fetchedDetailDict: favMovieDetailDict }} />
		</Container>
	);
}

export default Home;
