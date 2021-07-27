const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs')  

const root_folder = "library"
const root_url = "https://www.ttkan.co/novel/chapters/futianshi-jingwuhen";
const domain_url = "https://www.bg3.co";
const chapter_url = "https://www.bg3.co/novel/pagea/futianshi-jingwuhen_2705.html";

const DownloadChapter = async (dir, title, url) => {
	const { data } = await axios.get(url);
	const $ = cheerio.load(data);
	const images = $('p');
	const len = images.length;
	let txt = "";
	for (let i=0; i<len; i++) {
		let row = images[i.toString()].children[0].data;
		row = row.replace(/ /g, "").replace("\n", "");
		txt += row + "\n";
	}
	try {
		await fs.writeFileSync(`./${root_folder}/${dir}/${title}.txt`, txt);
	} catch(err) {
		throw(err);
	}
}

const DownloadNovel = async (url) => {
	const { data } = await axios.get(url);
	const $ = cheerio.load(data);
	const chapters = $('div.chapter_cell');
	const _novel_name = $('h3.chapters_title');
	const novel_title = _novel_name['0'].children[0].data.replace(" 最近章節", "");
	let chapter_list = [];
	const len = chapters.length;
	for(let i=0; i<len; i++) {
		try {
			let title = chapters[i.toString()].children[0].children[0].data;
			let link = domain_url + chapters[i.toString()].children[0].attribs.href;
			chapter_list.push({ title, link });
		} catch(err) {
			// do nothing
		}
	}
	try {
		fs.mkdirSync(`./${root_folder}`);
	} catch (err) {
		// path exist
	}
	try {
		fs.mkdirSync(`./${root_folder}/${novel_title}`)
	} catch (err) {
		// path exist
	}

	chapter_list.map(async (ch) => {
		await DownloadChapter(novel_title, ch.title, ch.link);
	})
}

//DownloadEpisode(episode_url);
DownloadNovel(root_url);

//https://img001.tongrenshuangbaozhaoshang.com/images/comic/2019/4036371/36fceecf4f.jpg!page-800-x
//https://img001.tongrenshuangbaozhaoshang.com/images/comic/2019/4036371/3643cbfeed.jpg!page-800-x