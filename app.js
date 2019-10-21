const video = document.getElementById('video');

Promise.all([
	faceapi.nets.tinyFaceDetector.loadFromUri('/face-detection_JS//models'),
	faceapi.nets.faceLandmark68Net.loadFromUri('/face-detection_JS//models'),
	faceapi.nets.faceRecognitionNet.loadFromUri('/face-detection_JS//models'),
	faceapi.nets.faceExpressionNet.loadFromUri('/face-detection_JS//models'),
	])
	.then(startVideo())
	.catch(err => console.log(err));
	

function startVideo() {
	navigator.getUserMedia({video: true}, stream => video.srcObject = stream, err => console.log(err));
}

video.addEventListener('play', () => {
	const canvas = faceapi.createCanvasFromMedia(video);
	document.querySelector('#face-api').append(canvas)
	const displaySize = {width: 720, height: 560}
	faceapi.matchDimensions(canvas, displaySize);
	setInterval(async () => {
		const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
		// console.log(detections);
		const resizedDetections = faceapi.resizeResults (detections, displaySize);
		canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
		faceapi.draw.drawDetections(canvas, resizedDetections);
		faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
		faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
		// video.style.display = 'none';
		}, 100)
})