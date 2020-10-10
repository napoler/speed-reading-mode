const TokenName = {
	WORD: 0,
	PARAGRAPH_END: 1,
	ARTICLE_END: 2,
	IMAGE: 3,
	WORD_NUM:7, //每次显示的字数
	
};

const paragraphParser = (node, wait) => {
	const tokensVal = node.innerText.split(' ');
	const tokens = tokensVal.reduce(function(list, word) {
		return [...list, [word, TokenName.WORD, wait.WORD]]
	}, []);
	const endToken = ['', TokenName.PARAGRAPH_END, wait.PARAGRAPH_END];
	return [...tokens, endToken];
}

const figureParser = (node, wait) => {
	const imageNodes = [...node.querySelectorAll('img')];
	const figureCaptionNode = node.querySelector('figcaption');
	let caption = '';
	if (figureCaptionNode != null) {
		figureCaptionNode.innerText;
	}
	return imageNodes.map(imageNode => {
		const url = imageNode.getAttribute('src');
		if (caption == '' && imageNode.getAttribute('alt') != null) {
			caption = imageNode.getAttribute('alt');
		}
		return [{url, caption}, TokenName.IMAGE, wait.IMAGE];
	});
}

const parseArticle = (article, wait) => {
	const tokens = article.reduce(function(parsed, node) {
		if (node.tagName == 'P') {
			parsedParagraph = paragraphParser(node, wait);
			return [...parsed, ...parsedParagraph];
		}
		if (node.tagName == 'FIGURE') {
			parsedFigure = figureParser(node, wait);
			return [...parsed, ...parsedFigure];
		}
		return parsed;
	}, []);
	return [...tokens, ['', TokenName.ARTICLE_END, wait.ARTICLE_END]];
}

// terry

//js将数组按固定长度分割

function cutArray(array, subLength) {
    let index = 0;
    let newArr = [];
    while(index < array.length) {
        newArr.push(array.slice(index, index += subLength).join(""));
    }
    return newArr;
}


const paragraphParserTerry = (node, wait) => {
	//let temp = node.innerText.split(' ');
	let temp =node.innerText.split(/[\n\s+,，；;?？。《》”“]/g); //中英文逗号 中英文分号 回车 空格分隔/切割字符串s
	var tokensVal =new Array();
	
	for (var i = 0; i < temp.length; i++) {
	if (temp[i] == "") {
	    //函数splice(para1,para2):删除数组中任意数量的项，从para1开始的para2个。
	// 删除数组中空值
		temp.splice(i, 1);
		i--;
		console.log("remove",i)
	}else{
		console.log("no remove",i)
		 
		 //验证是否是中文
		 
		var pattern = new RegExp("[\u4E00-\u9FA5]+");
		 
		//var str = "中文字符"
		 
		if(pattern.test(temp[i])){
		 
		    console.log('该字符串是中文');
		    console.log('中文切割',temp[i].split(''));
		    console.log("tokensVal1",tokensVal);
		    //tokensVal.concat(temp[i].split(''));
		    tokensVal.push.apply(tokensVal, temp[i].split(''));
		    console.log("tokensVal2",tokensVal);
		 
		}else{
		//非中文字符串
		     tokensVal.push(temp[i]," ");
		
		}
		
		console.log("tokensVal",tokensVal);

 
 
	}
	
	}
	
	//const tokensVal = temp;
	//对字符进行切片
	tokensVal=cutArray(tokensVal,TokenName.WORD_NUM);
	console.log("new",tokensVal)
	console.log("wait",wait)
	const tokens = tokensVal.reduce(function(list, words) {
		return [...list, [words, TokenName.WORD, wait.WORD*TokenName.WORD_NUM]]
	}, []);
	const endToken = ['', TokenName.PARAGRAPH_END, wait.PARAGRAPH_END];
	return [...tokens, endToken];
}



const parseArticleTerry = (article, wait) => {
	const tokens = article.reduce(function(parsed, node) {
		if (node.tagName == 'P') {
			parsedParagraph = paragraphParserTerry(node, wait);
			return [...parsed, ...parsedParagraph];
		}
		if (node.tagName == 'FIGURE') {
			parsedFigure = figureParser(node, wait);
			return [...parsed, ...parsedFigure];
		}
		return parsed;
	}, []);
	return [...tokens, ['', TokenName.ARTICLE_END, wait.ARTICLE_END]];
}

