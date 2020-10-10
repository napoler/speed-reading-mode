const renderImageInput = checked => {
	const imageWrapperNode = document.getElementById('image-duration-wrapper');
	if (checked) {
		imageWrapperNode.style.display = 'none';
	} else {
		imageWrapperNode.style.display = 'block';
	}
}

const pauseImgNode = document.getElementById('pause_img');
pauseImgNode.addEventListener('change', e => (
	renderImageInput(e.target.checked)
));

const sendMessage = settings => tabs => {
	for (const tab of tabs) {
		// 在获取页面内容的脚本中使用 browser.runtime.sendMessage() 方法发起消息。然后在插件界面脚本中用 browser.runtime.onMessage.addListener() 方法来监听捕获消息。以此来实现页面脚本和插件界面脚本的消息通讯。
		browser.tabs.sendMessage(tab.id, settings)
		.then(console.log)
		.catch(console.error);
	}
}

const form = document.getElementById('popup-form');
form.addEventListener("submit", function(e) {
	e.preventDefault();

	const formData = new FormData(form);
	const formDataObj = [...formData.entries()].reduce(function(obj, [key, val]) {
		return Object.assign(obj, {[key]:val});
	}, {})
	formDataObj['pause_img'] = pauseImgNode.checked;
	// 保存配置
	browser.storage.local.set(formDataObj);

	browser.tabs.query({
		currentWindow: true,
		active: true
	})//将配置数据发送给tabs
	.then(sendMessage(formDataObj))
	.then(() => window.close())
	.catch(console.error);
});

window.addEventListener('load', function() {
	// 加载配置
	browser.storage.local.get()
	.then(function(data) {
		for (const key in data) {
			if (key == 'pause_img') {
				pauseImgNode.checked = data[key];
				renderImageInput(data[key]);
			} else {
				document.getElementById(key).value = data[key];
			}
		}
	})
});
