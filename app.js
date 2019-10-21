const video = document.getElementById('video');

Promise.all([
	faceapi.nets.tinyFaceDetector.loadFromUri('/face-detection_JS//models'),
	faceapi.nets.faceLandmark68Net.loadFromUri('/face-detection_JS//models'),
	faceapi.nets.faceRecognitionNet.loadFromUri('/face-detection_JS//models'),
	faceapi.nets.faceExpressionNet.loadFromUri('/face-detection_JS//models'),
	faceapi.nets.ssdMobilenetv1.loadFromUri('/face-detection_JS/models')
	])
	.then(startVideo())
	.catch(err => console.log(err));
	

async function startVideo() {
	navigator.getUserMedia({video: true}, stream => video.srcObject = stream, err => console.log(err));
}

video.addEventListener('play', async () => {
	const labeledFaceDescriptors = await loadLabeledImages();
	const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
	const canvas = faceapi.createCanvasFromMedia(video);
	document.querySelector('#face-api').append(canvas)
	const displaySize = {width: 720, height: 560}
	faceapi.matchDimensions(canvas, displaySize);
	setInterval(async () => {
		const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors();
		// const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors().withFaceExpressions();
		const resizedDetections = faceapi.resizeResults (detections, displaySize);
		canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
		const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
		results.forEach((result, i) => {
			const box = resizedDetections[i].detection.box;
			const drawBox = new faceapi.draw.DrawBox(box, {label: result.toString()});
			drawBox.draw(canvas);
		})
		
		// faceapi.draw.DrawBox(canvas, resizedDetections)
		faceapi.draw.drawDetections(canvas, resizedDetections);
		faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
		faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
		// video.style.display = 'none';
		}, 100)
})

function loadLabeledImages() {
	const labels = ['Piyush'];
	return Promise.all(
		labels.map(async label => {
			const description = [];
			for(let i=1; i<2; i++){
				const image = await faceapi.fetchImage(`/face-detection_JS/labeled_images/${label}/${i}.jpg`);
				const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
				description.push(detections.descriptor)
			}
			return new faceapi.LabeledFaceDescriptors(label, description);
		})
	)
}