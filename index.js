/*
 * Author: fatsoap
 * Description:
 *   Novel Downloader using web spider
 *   Just for practice :)
 */



const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs')  

const root_folder = "library"
const root_url = "https://www.ttkan.co/novel/chapters/futianshi-jingwuhen";
//const domain_url = "https://www.bg3.co";

const GetAllChapter = async (all_ch_url) => {
	const { data } = await axios.get(all_ch_url);
	const novel_en = all_ch_url.replace(/.*novel_id=/, '');
	const _list = data.items;
	let list = [];
	_list.map((l) => {
		list.push({
			link: `https://www.bg3.co/novel/pagea/${novel_en}_${l.chapter_id}.html`,
			chapter_name: l.chapter_name
		});
	})

	return list;
}

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
	let all_ch_ = $('button#button_show_all_chatper')['0'].attribs.on;
	all_ch_ = all_ch_.replace(/.*\({/, '{').replace(/}\).*/, '}').replace("srcUrl", `"srcUrl"`).replace(/[']/g, '"');
	all_ch_url = "https://tw.ttkan.co" + JSON.parse(all_ch_).srcUrl;
	chapter_list = await GetAllChapter(all_ch_url)
	
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
	chapter_list = chapter_list.slice(0, 30);
	process.stdout.write(`Downloading Novel ${novel_title} ... \n`);
	for(let i=0; i<chapter_list.length; i++) {
		const dots = ".".repeat(i+1)
		const left = chapter_list.length - i - 1
		const empty = " ".repeat(left)
		process.stdout.write(`\r[${dots}${empty}] ${i+1}/${chapter_list.length}`)
		await DownloadChapter(novel_title, chapter_list[i].chapter_name, chapter_list[i].link);
	}
}


let download_url = process.argv[2];
if (download_url) {
	DownloadNovel(download_url);
} else {
	console.log("No Input Url ... ")
}

