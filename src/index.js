//////////////////
// Canvas Setup //
//////////////////

const canvas = document.querySelector('canvas')

// C for Context
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, 70 + i))
}

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 70) {
    battleZonesMap.push(battleZonesData.slice(i, 70 + i))
}








///////////////////
// Asset Loading //
///////////////////

// Loading image of Map
const image = new Image()
image.src = './static/ChrisCourses-Pokemon/Tiled/map1.png'

// Loading image of Foreground map
const foregroundImage = new Image()
foregroundImage.src = './static/ChrisCourses-Pokemon/Tiled/foregroundmap.png'

// Loading sprite sheets of character directions
const playerUpImage = new Image()
playerUpImage.src = './static/ChrisCourses-Pokemon/Images/playerUp.png'

const playerRightImage = new Image()
playerRightImage.src = './static/ChrisCourses-Pokemon/Images/playerRight.png'

const playerDownImage = new Image()
playerDownImage.src = './static/ChrisCourses-Pokemon/Images/playerDown.png'

const playerLeftImage = new Image()
playerLeftImage.src = './static/ChrisCourses-Pokemon/Images/playerLeft.png'



//////////////////////////
// Class Implementation //
//////////////////////////

const boundaries = []
const offset = {
    x: -545,
    y: -515
}

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
        {boundaries.push(
            new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
        }}))} else if (symbol === 1026)
        {boundaries.push(
            new Boundary({
                position: {
                    x: j * (Boundary.width) + offset.x + 20,
                    y: i * Boundary.height + offset.y
        }}))}
    })
})

const battleZones = []

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
        {battleZones.push(
            new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
        }}))} 
    })
})



const player = new Sprite({
    position: {
        x: canvas.width / 2 - 192 / 4 / 2,
        y: canvas.height / 2 - 68 / 2
    },
    image: playerDownImage,
    frames: {
        max: 4,
        hold: 10
    },
    sprites: {
        up: playerUpImage,
        right: playerRightImage,
        down: playerDownImage,
        left: playerLeftImage,
    }
})

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage
})





////////////////
// Key Events //
////////////////

let lastKey = ''
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }
})

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})






///////////////
// Animation //
///////////////

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}


const movables = [
    background,
    ...boundaries,
    foreground,
    ...battleZones
]

function rectangularCollision({rectangle1, rectangle2}) {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x && rectangle1.position.x <= rectangle2.position.x + rectangle2.width && 
        rectangle1.position.y + rectangle1.width >= rectangle2.position.y &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.width)
}

const battle = {
    initiated: false
}

function animate() {
    const animationId = window.requestAnimationFrame(animate)
    background.draw()
    boundaries.forEach(boundary => {
        boundary.draw()
    })
    battleZones.forEach(battleZone => {
        battleZone.draw()
    })
    player.draw()
    foreground.draw()

    let moving = true
    player.animate = false

    if (battle.initiated) return
    
    // Battle Zone Detection, Activate a Battle
    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        for (let i = 0; i < battleZones.length; i++) {

            const battleZone = battleZones[i]
            const overlappingArea = (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) - Math.max(player.position.x, battleZone.position.x)) * (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) - Math.max(player.position.y, battleZone.position.y))

            // Battle Zone Collision Detection
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: battleZone
                }) &&
                overlappingArea > (player.width * player.height) / 2
                &&
                Math.random() < 0.01
            ) {
                // deactivate current animation loop
                window.cancelAnimationFrame(animationId)

                audio.Map.stop()
                audio.initBattle.play()
                audio.battle.play()

                battle.initiated = true
                gsap.to('#overlappingDiv', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                 // activate a new animation loop
                                initBattle()
                                animateBattle()
                                gsap.to('#overlappingDiv', {
                                    opacity: 0,
                                    duration: 0.4
                                    }
                                )
                            }
                        })
                    }
                }) 
                break
            }
        }
    }

    // Movement via WASD
    if (keys.w.pressed && lastKey === 'w') {
        player.animate = true
        player.image = player.sprites.up
        for (let i = 0; i < boundaries.length; i++) {

            const boundary = boundaries[i]

            // Boundary Collision Detection
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {...boundary, position: {
                        x: boundary.position.x,
                        y: boundary.position.y + 3
                    }}
                })
            ) {
                moving = false
                break
            }
        }

        if (moving)
        movables.forEach((movable) => {
            movable.position.y += 3
        })
    } else if (keys.a.pressed  && lastKey === 'a') {
        player.animate = true
        player.image = player.sprites.left
        for (let i = 0; i < boundaries.length; i++) {

            const boundary = boundaries[i]

            // Boundary Collision Detection
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {...boundary, position: {
                        x: boundary.position.x + 3,
                        y: boundary.position.y
                    }}
                })
            ) {
                moving = false
                break
            }
        }

        if (moving)
        movables.forEach((movable) => {
            movable.position.x += 3
        })
    } else if (keys.s.pressed  && lastKey === 's') {
        player.animate = true
        player.image = player.sprites.down
        for (let i = 0; i < boundaries.length; i++) {

            const boundary = boundaries[i]

            // Boundary Collision Detection
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {...boundary, position: {
                        x: boundary.position.x,
                        y: boundary.position.y - 3
                    }}
                })
            ) {
                moving = false
                break
            }
        }

        if (moving)
        movables.forEach((movable) => {
            movable.position.y -= 3
        })
    } else if (keys.d.pressed && lastKey === 'd') {
        player.animate = true
        player.image = player.sprites.right
        for (let i = 0; i < boundaries.length; i++) {

            const boundary = boundaries[i]

            // Boundary Collision Detection
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {...boundary, position: {
                        x: boundary.position.x - 3,
                        y: boundary.position.y
                    }}
                })
            ) {
                moving = false
                break
            }
        }

        if (moving)
        movables.forEach((movable) => {
            movable.position.x -= 3
        })
    }
}

let clicked = false
addEventListener('click', () => {
    if (!clicked) {
        audio.Map.play()
        clicked = true
    }
})