import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from './component/navbar/Navbar';
import FootBar from './component/footbar/FootBar';
import ShowMsg from './component/showMsg/ShowMsg';
import SearchBox from './component/searchBox/searchBox';
import PaginationBox from './component/paginationBox/PaginationBox';
import Modal from './component/modal/Modal';
import Loader from './component/loader/Loader';
import './styles/App.css';

const apiBaseUrl = 'https://pixabay.com/api/?key=42924722-dace8e4abf3fa9bc9cc2b7de6';

function App() {
	const [data, setData] = useState({});
	const [page, setpage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalData, setModalData] = useState({});
	const [searchText, setSearchText] = useState(new URLSearchParams(window.location.search).get('search') || '');

	const navigate = useNavigate();

	const handleMsgShown = useCallback((msgText, type) => {
		if (msgText) {
			setMsg({ text: msgText, type: type });
			setTimeout(() => {
				setMsg({ text: '', type: '' });
			}, 2500);
		} else {
			console.log('Please Provide Text Msg');
		}
	}, []);

	const handleSearch = useCallback(
		async (e, isParams, currentPage) => {
			if (!isParams) e.preventDefault();
			const searchText = e.target?.searchBox?.value?.trim();
			if (!searchText) return handleMsgShown('Please enter a search term');
			if (!isParams) navigate('/?search=' + searchText);
			if (!currentPage) currentPage = new URLSearchParams(window.location.search).get('page') || 1;
			setSearchText(searchText);
			try {
				setLoading(true);
				const response = await fetch(apiBaseUrl + '&q=' + searchText + '&page=' + currentPage);
				const data = await response.json();
				if (response.status === 200) {
					setData(data);
					console.log(data);
				} else {
					handleMsgShown(data?.message);
				}
			} catch (e) {
				console.log(e);
				handleMsgShown('Something went wrong');
			} finally {
				setLoading(false);
			}
		},
		[handleMsgShown, navigate]
	);

	useEffect(() => {
		const search = new URLSearchParams(window.location.search).get('search');
		if (search) {
			handleSearch({ target: { searchBox: { value: search } } }, true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handlePageChange = useCallback(
		(page) => {
			if (page < 1) return handleMsgShown('You are already on first page');

			setpage(page);
			const search = new URLSearchParams(window.location.search).get('search');
			navigate('/?search=' + search + '&page=' + page);
			window.scrollTo(0, 0);
			handleSearch({ target: { searchBox: { value: search } } }, true, page);
		},
		[handleMsgShown, navigate, handleSearch]
	);

	const resetToHomePage = useCallback(() => {
		navigate('/');
		setData({});
		setpage(1);
		setSearchText('');
		window.scrollTo(0, 0);
	}, [navigate]);

	const handleModal = useCallback(
		(item) => {
			if (!isModalOpen) {
				setModalData(item);
				document.body.style.overflow = 'hidden';
			} else {
				setModalData({});
				document.body.style.overflow = 'auto';
			}
			setIsModalOpen((prev) => !prev);
		},
		[isModalOpen]
	);
	return (
		<>
			<Navbar
				handleSearch={handleSearch}
				resetToHomePage={resetToHomePage}
				searchText={searchText}
				setSearchText={setSearchText}
			/>
			<div className="appContainer">
				<Loader isLoading={loading} />
				{!data?.hits && <SearchBox handleSearch={handleSearch} />}

				{data?.hits && (
					<>
						<div className="imageGrid">
							{data?.hits?.map((item) => {
								return (
									<div key={item.id} onClick={() => handleModal(item)}>
										<img src={item.webformatURL} alt={item.tags} className="appImage" />
									</div>
								);
							})}
						</div>
						{isModalOpen && <Modal handleModal={handleModal} modalData={modalData} />}
						<PaginationBox
							handlePageChange={handlePageChange}
							page={page}
							setpage={setpage}
							handleSearch={handleSearch}
						/>
					</>
				)}
			</div>
			<FootBar />
			{msg && <ShowMsg msgText={msg?.text} type={msg?.type} />}
		</>
	);
}

export default App;
