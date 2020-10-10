// 设置休眠时间
const sleep = async function(time) {
	return new Promise(resolve => setTimeout(resolve, time));
};


// 加载内容框架
const insertContainer = function() {
	let container = document.createElement('div');
	container.id = 'speed-read-container';
	const repeatIcon = 'svg'
	container.innerHTML = `
		<div class="speed-read-nav">
			<div class="speed-read-button-group speed-read-float-left">
				<span id="speed-read-restart-button">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-skip-back"><polygon points="19 20 9 12 19 4"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
				</span>
				<span id="speed-read-back-5s">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-rewind"><polygon points="11 19 2 12 11 5"></polygon><polygon points="22 19 13 12 22 5"></polygon></svg>
				</span>
                <span id="speed-read-pause">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-rewind"><line x1="8" y1="19" x2="8" y2="5"></line><line x1="16" y1="19" x2="16" y2="5"></line></svg>
                </span>
                <span id="speed-read-resume" style="display:none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-rewind"><polygon points="8 19 17 12 8 5"></polygon></svg>
                </span>
				<span id="speed-read-time-remaining"></span>
				<span id="speed-read-totalTokens"></span>
			</div>
			<div class="speed-read-button-group speed-read-float-right">
				<span id="speed-read-close-button">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
				</span>
			</div>
			<div class="speed-read-clearfix"></div>
			<div class="speed-read-range">
				<input type="range" min=0 max=1 id="speed-read-range" />
			</div>
		</div>
		<div id="speed-read-center-text"></div>
	`;
	document.body.appendChild(container);
};


// 阅读控制主体
class SpeedRead {
	constructor(tokens, settings) {
		this.tokens = tokens;
		this.cancelled = false;
        this.paused = false;
        this.counter = 0;
        this.totalTokens = tokens.length;
        console.log("tokens",tokens)

        this.nodes = {
            container: document.getElementById('speed-read-container'),
            centerText: document.getElementById('speed-read-center-text'),
            pause: document.getElementById('speed-read-pause'),
            resume: document.getElementById('speed-read-resume'),
            range: document.getElementById('speed-read-range'),
            close: document.getElementById('speed-read-close-button'),
            restart: document.getElementById('speed-read-restart-button'),
            rewind: document.getElementById('speed-read-back-5s'),
        };
        this.prepareDOM();

	}

    prepareDOM() {
        this.nodes.pause.addEventListener('click', e => this.setPaused(true));
        this.nodes.resume.addEventListener('click', e => this.setPaused(false));
        this.nodes.container.addEventListener('click', e => {
            // This conditional is ugly and probably will lead to a bug in the future
            // TODO: remove this
            if (e.originalTarget == this.nodes.container ||
                e.originalTarget == this.nodes.centerText) {
                this.setPaused(!this.paused);
            }
        });

        this.nodes.range.setAttribute('max', this.totalTokens - 1);
        this.nodes.range.addEventListener('change', e => {
            this.counter = parseInt(e.target.value);
            //conlose.log("this.counter",this.counter);
            this.calculateTimeRemaining();
        });

        this.nodes.restart.addEventListener('click', e => this.restart());
        this.nodes.rewind.addEventListener('click', e => this.rewind());
        this.nodes.close.addEventListener('click', e => this.cancel());

        this.calculateTimeRemaining();
    }

    openContainer() {
        this.nodes.container.classList.add('active');
        window.scrollTo(0, 0);
    }

	isCancelled() {
		return this.cancelled;
	}

	cancel() {
		this.cancelled = true;
        this.nodes.container.classList.remove('active');
	}

    isPaused() {
        return this.paused;
    }

    setPaused(val) {
        this.paused = val;
        if (val) {
            this.nodes.pause.style.display = 'none';
            this.nodes.resume.style.display = 'initial';
        } else {
            this.nodes.pause.style.display = 'initial';
            this.nodes.resume.style.display = 'none';
        }
    }

    togglePaused() {
        this.setPaused(!this.paused);
    }

	increment() {
		if (this.totalTokens - this.counter > 1) {
			this.timeRemaining -= this.tokens[this.counter][2];
			this.counter += 1;
			this.nodes.range.value = this.counter;
		}
	}

	restart() {
		this.counter = 0;
		this.calculateTimeRemaining();
	}

	rewind(time = 5000) {
		while (time > 0) {
			time = time - this.tokens[this.counter][2];
			this.counter -= 1;
		}
		this.calculateTimeRemaining();
	}

	calculateTimeRemaining() {
		const tokens = this.tokens.slice(this.counter);
		this.timeRemaining = tokens.reduce(function(time, token) {
			return time + token[2];
		}, 0);
	}

	getHumanReadableTimeRemaining() {
		const minutes = Math.floor(this.timeRemaining / (1000 * 60));
		if (minutes > 1) {
			return minutes + ' minutes left';
		}
		if (minutes == 1) {
			return minutes + ' minute left';
		}
		const seconds = Math.floor(this.timeRemaining / 1000);
		return seconds + ' seconds left';
	}
}
// 运行代码
const run = async function(settings) {
    let articleContent = readability.grabArticle();
    articleContent = [...articleContent.childNodes[0].childNodes];
    console.log("parseInt(settings.wpm)",parseInt(settings.wpm));
    const wait = {
        WORD: 60000 / (parseInt(settings.wpm)/parseInt(settings.fragment_length)), //计算每段耗时   一分钟/每分钟多少字
        fragment_length:parseInt(settings.fragment_length),
        PARAGRAPH_END: parseInt(settings.paragraph_end),
        IMAGE: parseInt(settings.image),
        ARTICLE_END: 1000,
    };
    console.log("articleContent",articleContent);
 //   const tokens = parseArticle(articleContent, wait);
    const tokens = parseArticleTerry(articleContent, wait);
    console.log("tokens",tokens)
    const speedRead = new SpeedRead(tokens, settings);

    const centerText = document.getElementById('speed-read-center-text');
    const timeRemaining = document.getElementById('speed-read-time-remaining')
    const totalTokens = document.getElementById('speed-read-totalTokens')
    const togglePauseIfSpacePressed = e => {
        const key = e.keyCode ? e.keyCode : e.which;
        if (key == 32) {
            speedRead.togglePaused();
        }
    };
    document.addEventListener('keyup', togglePauseIfSpacePressed);

    speedRead.openContainer();
    while (!speedRead.isCancelled()) {
        //console.log("speedRead.tokens",speedRead.tokens)
    	const [val, type, delay] = speedRead.tokens[speedRead.counter];
    	timeRemaining.textContent = speedRead.getHumanReadableTimeRemaining();
        totalTokens.textContent = "进度："+speedRead.totalTokens+"段";
        
        while (speedRead.isPaused()) {
            await sleep(500);
        }
        //console.log(speedRead.counter)
        console.log(val, type, delay)
    	switch (type) {
            case TokenName.WORD: //追加文字
            
                centerText.innerHTML = centerText.innerHTML +"<span class='words'>"+val+"</span>";
                // centerText.textContent = val;
    			//centerText.innerHTML=centerText.innerHTML+"<div class='li'>"+val+"</div>";
    			//console.log(val)
    			await sleep(delay);
    			break;
            case TokenName.IMAGE:
                centerText.textContent = `
                    <img src="${val.url}" class="speed-read-image" />
                    <p class="speed-read-image-caption">${val.caption}</p>
                `;
                if (settings.pause_img) {
                    speedRead.setPaused(true);
                } else {
                    await sleep(wait.IMAGE);
                }
                break;
    		case TokenName.PARAGRAPH_END:
                centerText.innerHTML = centerText.innerHTML +"<div class='end'><hr></div>";
    		case TokenName.ARTICLE_END:
                // centerText.innerHTML = centerText.innerHTML +"<div class='end'>文章结束！</div>";
    			await sleep(delay);
    			break;
    	}
    	speedRead.increment();
    }

    document.removeEventListener('keyup', togglePauseIfSpacePressed);
};
// 执行加载内容框架
insertContainer();
// BrowserDetect.browser.runtime.onMessage.addListener(function(settings) {
// 火狐监听
browser.runtime.onMessage.addListener(function(settings) {
    // 运行
	run(settings);
})
