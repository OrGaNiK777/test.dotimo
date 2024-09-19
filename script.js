const playground = document.getElementById('playground')
const cube1 = document.getElementById('cube1')
const cube2 = document.getElementById('cube2')
const colorPicker = document.getElementById('colorPicker')

let selectedCube1 = null
let selectedCube2 = null
let attached = false
let attachOffsetX1 = 0
let attachOffsetY1 = 0
let attachOffsetX2 = 0
let attachOffsetY2 = 0

function makeDraggable(cube) {
	cube.onmousedown = function (e) {
		handleMouseDown(e, cube)
	}
}

function handleMouseDown(e, cube) {
	let shiftX = e.clientX - cube.getBoundingClientRect().left
	let shiftY = e.clientY - cube.getBoundingClientRect().top

	if (attached) {
		if (cube === cube1) {
			shiftX = shiftX + attachOffsetX1;
			shiftY = shiftY + attachOffsetY1;
		} else if (cube === cube2) {
			shiftX = shiftX + attachOffsetX2;
			shiftY = shiftY + attachOffsetY2;
		}
	}

	function moveAt(pageX, pageY) {
		selectedCube1 = cube
		const rect = playground.getBoundingClientRect()
		let newX = pageX - rect.left - shiftX
		let newY = pageY - rect.top - shiftY

		if (newX < 0) newX = 0
		if (newY < 0) newY = 0
		if (newX + cube.offsetWidth > playground.offsetWidth) {
			newX = playground.offsetWidth - cube.offsetWidth
		}
		if (newY + cube.offsetHeight > playground.offsetHeight) {
			newY = playground.offsetHeight - cube.offsetHeight
		}

		if (attached && (cube === cube1 || cube === cube2)) {
			cube1.style.left = newX + attachOffsetX1 + 'px'
			cube1.style.top = newY + attachOffsetY1 + 'px'
			cube2.style.left = newX + attachOffsetX2 + 'px'
			cube2.style.top = newY + attachOffsetY2 + 'px'
		} else {
			cube.style.left = newX + 'px'
			cube.style.top = newY + 'px'
		}

		checkAttach()
	}

	function onMouseMove(e) {
		moveAt(e.pageX, e.pageY)
	}

	document.addEventListener('mousemove', onMouseMove)

	document.onmouseup = function () {
		document.removeEventListener('mousemove', onMouseMove)
	}

	cube.ontouchmove = function (e) {
		const touch = e.touches[0]
		moveAt(touch.pageX, touch.pageY)
	}

	document.ontouchend = function () {
		document.removeEventListener('touchmove', moveAt)
	}

	cube.onclick = function (event) {
		event.stopPropagation()
		if (selectedCube2 === cube) {
			selectedCube2.style.border = null
			selectedCube2 = null
		} else {
			if (selectedCube2) {
				selectedCube2.style.border = null
				selectedCube2 = null
			}
			selectedCube2 = cube
			cube.style.border = `5px solid black`
			colorPicker.value = rgbToHex(cube.style.backgroundColor)
		}
	}
}

function rgbToHex(rgb) {
	const result = rgb
		.match(/\d+/g)
		.map((x) => parseInt(x).toString(16).padStart(2, '0'))
		.join('')
	return `#${result}`
}

colorPicker.addEventListener('input', function () {
	if (selectedCube2) {
		selectedCube2.style.backgroundColor = colorPicker.value
	}
})

function checkAttach() {
	if (attached) return

	const rect1 = cube1.getBoundingClientRect()
	const rect2 = cube2.getBoundingClientRect()
	const distance = Math.hypot(rect1.left - rect2.left, rect1.top - rect2.top)

	if (distance < 100) {
		attached = true
		mergeCubes(rect1, rect2)
	}
}

function mergeCubes(rect1, rect2) {
	const distanceRight = rect1.right - rect2.left
	const distanceLeft = rect1.left - rect2.right
	const distanceTop = rect1.top - rect2.bottom
	const distanceBottom = rect1.bottom - rect2.top

	if (Math.abs(distanceRight) < Math.abs(distanceLeft) && Math.abs(distanceRight) < Math.abs(distanceTop) && Math.abs(distanceRight) < Math.abs(distanceBottom)) {
		if (selectedCube1 !== cube1) {
			attachOffsetX1 = -rect1.width
			attachOffsetY1 = rect1.top - rect2.top
		} else {
			attachOffsetX2 = rect1.width
			attachOffsetY2 = -(rect1.top - rect2.top)
		}
	} else if (Math.abs(distanceLeft) < Math.abs(distanceRight) && Math.abs(distanceLeft) < Math.abs(distanceTop) && Math.abs(distanceLeft) < Math.abs(distanceBottom)) {
		if (selectedCube1 !== cube1) {
			attachOffsetX1 = rect2.width
			attachOffsetY1 = rect1.top - rect2.top
		} else {
			attachOffsetX2 = -rect2.width
			attachOffsetY2 = -(rect1.top - rect2.top)
		}
	} else if (Math.abs(distanceBottom) < Math.abs(distanceTop) && Math.abs(distanceBottom) < Math.abs(distanceRight) && Math.abs(distanceBottom) < Math.abs(distanceLeft)) {
		if (selectedCube1 !== cube1) {
			attachOffsetX1 = rect1.left - rect2.left
			attachOffsetY1 = -rect1.height
		} else {
			attachOffsetX2 = -(rect1.left - rect2.left)
			attachOffsetY2 = rect1.height
		}
	} else {
		if (selectedCube1 !== cube1) {
			attachOffsetX1 = rect1.left - rect2.left
			attachOffsetY1 = rect2.height
		} else {
			attachOffsetX2 = -(rect1.left - rect2.left)
			attachOffsetY2 = -rect2.height
		}
	}
}

function detachCubes() {
	if (selectedCube1) {
		selectedCube1 = null
	}
	if (selectedCube2) {
		selectedCube2 = null
		cube1.style.border = null
		cube2.style.border = null
	}

	attached = false
	attachOffsetX1 = 0
	attachOffsetY1 = 0
	attachOffsetX2 = 0
	attachOffsetY2 = 0
	colorPicker.value = null
	cube1.style.pointerEvents = 'auto'
	cube2.style.pointerEvents = 'auto'

	cube1.style.left = Math.random() * (playground.offsetWidth - cube1.offsetWidth) + 'px'
	cube1.style.top = Math.random() * (playground.offsetHeight - cube1.offsetHeight) + 'px'
	cube2.style.left = Math.random() * (playground.offsetWidth - cube2.offsetWidth) + 'px'
	cube2.style.top = Math.random() * (playground.offsetHeight - cube2.offsetHeight) + 'px'
}

document.getElementById('detachButton').onclick = detachCubes

window.onload = detachCubes

makeDraggable(cube1)
makeDraggable(cube2)
