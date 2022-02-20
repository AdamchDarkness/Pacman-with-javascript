
const canvas = document.querySelector('canvas')
const d = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')

canvas.width = innerWidth
canvas.height = innerHeight

class Boundary
{
    static width = 40
    static height = 40
    constructor({position, image})
    {
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image
    }

    draw()
    {
          d.drawImage(this.image, this.position.x, this.position.y)
    }
}

class Player
{
    constructor({position, velocity})
    {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.radians = 0.75
        this.openRate = 0.12
        this.rotation = 0
    }
    draw()
    {
        d.save()
        d.translate(this.position.x, this.position.y)
        d.rotate(this.rotation)
        d.translate(-this.position.x, -this.position.y)
        d.beginPath()
        d.arc(this.position.x, this.position.y,
            this.radius, this.radians, Math.PI * 2 - this.radians)
            d.lineTo(this.position.x, this.position.y)
            d.fillStyle = 'yellow'
            d.fill()
        d.closePath()
        d.restore()
    }
    update()
    {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if(this.radians < 0 || this.radians > 0.75) this.openRate = -this.openRate

        this.radians += this.openRate
    }
}

class Ghost
{
    static speed = 2
    constructor({position, velocity, color})
    {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.color = color
        this.prevCollisions = []
        this.speed = 2
        this.scared = false
    }
    draw()
    {
        d.beginPath()
        d.arc(this.position.x, this.position.y,
            this.radius, 0, Math.PI * 2)
            d.fillStyle = this.scared ? 'darkblue' : this.color
            d.fill()
        d.closePath()
    }
    update()
    {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Pellet
{
    constructor({position})
    {
        this.position = position
        this.radius = 3
    }
    draw()
    {
        d.beginPath()
        d.arc(this.position.x, this.position.y,
            this.radius, 0, Math.PI * 2)
            d.fillStyle = 'white'
            d.fill()
        d.closePath()
    }
}

class PowerUp
{
    constructor({position})
    {
        this.position = position
        this.radius = 8
    }
    draw()
    {
        d.beginPath()
        d.arc(this.position.x, this.position.y,
            this.radius, 0, Math.PI * 2)
            d.fillStyle = 'white'
            d.fill()
        d.closePath()
    }
}


const pellets = []
let score=0

const boundaries = []
const powerUps = []
// for add a ghost copy new ghost and change the color
const ghosts = [
    new Ghost({
        position:{
            x:Boundary.width * 6 + Boundary.width / 2,
            y:Boundary.height + Boundary.height /2
        },
        velocity:
        {
            x:Ghost.speed,
            y:0
        },
        color: 'red'
    }),
    new Ghost({
        position:{
            x:Boundary.width * 13 + Boundary.width / 2,
            y:Boundary.height * 4 + Boundary.height /2
        },
        velocity:
        {
            x:Ghost.speed,
            y:0
        },
        color: 'grey'
    }),
    new Ghost({
        position:{
            x:Boundary.width * 18 + Boundary.width / 2,
            y:Boundary.height * 3 + Boundary.height /2
        },
        velocity:
        {
            x:Ghost.speed,
            y:0
        },
        color: 'green'
    }),
    new Ghost({
        position:{
            x:Boundary.width * 18 + Boundary.width / 2,
            y:Boundary.height * 11 + Boundary.height /2
        },
        velocity:
        {
            x:Ghost.speed,
            y:0
        },
        color: 'pink'
    }),
    new Ghost({
        position:{
            x:Boundary.width * 6 + Boundary.width / 2,
            y:Boundary.height * 11 + Boundary.height /2
        },
        velocity:
        {
            x:Ghost.speed,
            y:0
        },
        color: 'orange'
    })
]

const player = new Player({
    position:{
        x:Boundary.width + Boundary.width / 2,
        y:Boundary.height + Boundary.height /2
    },
    velocity:{
        x: 0,
        y:0
    }
    
})

let lastKey = ''
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
// change the symbole for change the map
const map = 
  [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', 'p', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', 'p', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
  ]
function createImage(src)
{
    const image = new Image()
    image.src = src
    return image
}
//here each element of the map is 
//linked to an image if you want to change the map 
//just change the symbols in the map
map.forEach((row, i) => {
    row.forEach((symbol, j) => {
      switch (symbol) {
        case '-':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./img/pipeHorizontal.png')
            })
          )
          break
        case '|':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./img/pipeVertical.png')
            })
          )
          break
        case '1':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./img/pipeCorner1.png')
            })
          )
          break
        case '2':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./img/pipeCorner2.png')
            })
          )
          break
        case '3':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./img/pipeCorner3.png')
            })
          )
          break
        case '4':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./img/pipeCorner4.png')
            })
          )
          break
        case 'b':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * i
              },
              image: createImage('./img/block.png')
            })
          )
          break
        case '[':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./img/capLeft.png')
            })
          )
          break
        case ']':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./img/capRight.png')
            })
          )
          break
        case '_':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./img/capBottom.png')
            })
          )
          break
        case '^':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./img/capTop.png')
            })
          )
          break
        case '+':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./img/pipeCross.png')
            })
          )
          break
        case '5':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              color: 'blue',
              image: createImage('./img/pipeConnectorTop.png')
            })
          )
          break
        case '6':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              color: 'blue',
              image: createImage('./img/pipeConnectorRight.png')
            })
          )
          break
        case '7':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              color: 'blue',
              image: createImage('./img/pipeConnectorBottom.png')
            })
          )
          break
        case '8':
          boundaries.push(
            new Boundary({
              position: {
                x: j * Boundary.width,
                y: i * Boundary.height
              },
              image: createImage('./img/pipeConnectorLeft.png')
            })
          )
          break
          case '.':
            pellets.push(
              new Pellet({
                position: {
                  x: j * Boundary.width + Boundary.width / 2,
                  y: i * Boundary.height + Boundary.height / 2
                }
              })
            )
            break
        case 'p':
            powerUps.push(
                new PowerUp({
                position: {
                    x: j * Boundary.width + Boundary.width / 2,
                    y: i * Boundary.height + Boundary.height / 2
                }
                })
            )
            break
        }
    })
  })

function circleCollideswithRectangle({
    circle,
    rectangle
})
{
    const padding = Boundary.width / 2 - circle.radius - 1
    return(circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding &&
        circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding && 
        circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding &&
        circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding)
}

let animationId
function animate()
{
    animationId = requestAnimationFrame(animate)
    d.clearRect(0, 0, canvas.width, canvas.height)
       
    if(keys.w.pressed && lastKey === 'w')
    { 
        for(let i = 0; i< boundaries.length; i++){
            const boundary = boundaries[i]
        if(circleCollideswithRectangle({
            circle: {...player, velocity: {
                x: 0,
                y: -5
            }},
            rectangle: boundary
        })){
            player.velocity.y = 0
            break
        }
        else
        {
            player.velocity.y = -5
        }
    }}
    else 
    if(keys.a.pressed && lastKey === 'a')
    {
        for(let i = 0; i< boundaries.length; i++){
            const boundary = boundaries[i]
        if(circleCollideswithRectangle({
            circle: {...player, velocity: {
                x: -5,
                y: 0
            }},
            rectangle: boundary
        })){
            player.velocity.x = 0
            break
        }
        else
        {
            player.velocity.x = -5
        }
    }}
    else 
    if(keys.s.pressed && lastKey === 's')
    {
        for(let i = 0; i< boundaries.length; i++){
            const boundary = boundaries[i]
        if(circleCollideswithRectangle({
            circle: {...player, velocity: {
                x: 0,
                y: 5
            }},
            rectangle: boundary
        })){
            player.velocity.y = 0
            break
        }
        else
        {
            player.velocity.y = 5
        }
    }}
    else 
    if(keys.d.pressed && lastKey === 'd')
    {
        for(let i = 0; i< boundaries.length; i++){
            const boundary = boundaries[i]
        if(circleCollideswithRectangle({
            circle: {...player, velocity: {
                x: 5,
                y: 0
            }},
            rectangle: boundary
        })){
            player.velocity.x = 0
            break
        }
        else
        {
            player.velocity.x = 5
        }
    }}

    for(let i = ghosts.length - 1; 0 <= i; i--)
    {
        const ghost = ghosts[i]
    if(Math.hypot(ghost.position.x - player.position.x, 
        ghost.position.y - player.position.y) < ghost.radius + player.radius)
        {
            if(ghost.scared)
            {
                ghosts.splice(i, 1)
            }
            else
            {
                cancelAnimationFrame(animationId)
                console.log('you lose')
            }
        }
    }

    if(pellets.length === 0)
    {
        cancelAnimationFrame(animationId)
        console.log('you win')
        
    }

    for(let i = powerUps.length - 1; 0 <= i; i--)
    {
        const powerUp = powerUps[i]
        powerUp.draw()

        if(Math.hypot(powerUp.position.x - player.position.x, 
            powerUp.position.y - player.position.y) < powerUp.radius + player.radius)
        {
            powerUps.splice(i, 1)

            ghosts.forEach(ghost => {
                ghost.scared = true
                setTimeout(() => {
                    ghost.scared = false
                }, 5000)
            })
        }
    }

    for(let i = pellets.length - 1; 0 <= i; i--)
    {
        const pellet = pellets[i]
        pellet.draw()
        if(Math.hypot(pellet.position.x - player.position.x, 
            pellet.position.y - player.position.y) < pellet.radius + player.radius)
            {
                pellets.splice(i, 1)
                score = score + 5
                scoreEl.innerHTML = score
            }
    }

    boundaries.forEach(Boundary => {
        Boundary.draw()

        if(circleCollideswithRectangle({
            circle: player,
            rectangle: Boundary
        }))
            {
                player.velocity.y = 0
                player.velocity.x = 0
            }
    })
    player.update()

    ghosts.forEach((ghost) => {
        ghost.update()

        

        const collisions = []
        boundaries.forEach(boundary => {
                if(
                    !collisions.includes('right') &&
                    circleCollideswithRectangle({
                circle: {...ghost, velocity: {
                    x: ghost.speed,
                    y: 0
                }},
                rectangle: boundary
            }))
            {
                collisions.push('right')
            }

            if(!collisions.includes('left') &&
                circleCollideswithRectangle({
                circle: {...ghost, velocity: {
                    x: -ghost.speed,
                    y: 0
                }},
                rectangle: boundary
            }))
            {
                collisions.push('left')
            }
            if(!collisions.includes('up') &&
                circleCollideswithRectangle({
                circle: {...ghost, velocity: {
                    x: 0,
                    y: -ghost.speed
                }},
                rectangle: boundary
            }))
            {
                collisions.push('up')
            }
            if(!collisions.includes('down') &&
                circleCollideswithRectangle({
                circle: {...ghost, velocity: {
                    x: 0,
                    y: ghost.speed
                }},
                rectangle: boundary
            }))
            {
                collisions.push('down')
            }
        })
        if(collisions.length > ghost.prevCollisions.length)
            ghost.prevCollisions = collisions

        if(JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions))
        {

            if(ghost.velocity.x > 0) ghost.prevCollisions.push('right')
            else if(ghost.velocity.x < 0) ghost.prevCollisions.push('left')
            else if(ghost.velocity.y < 0) ghost.prevCollisions.push('up') 
            else if(ghost.velocity.y > 0) ghost.prevCollisions.push('down')

            const pathways = ghost.prevCollisions.filter(collision => {
                return !collisions.includes(collision)
            })

            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            switch(direction){
                case 'down':
                    ghost.velocity.y = ghost.speed
                    ghost.velocity.x = 0
                    break
                case 'up':
                    ghost.velocity.y = -ghost.speed
                    ghost.velocity.x = 0
                    break
                case 'right':
                    ghost.velocity.y = 0
                    ghost.velocity.x = ghost.speed
                    break
                case 'left':
                    ghost.velocity.y = 0
                    ghost.velocity.x = -ghost.speed
                    break
            }
            ghost.prevCollisions = []
        }
    })

    if(player.velocity.x > 0) player.rotation = 0
    else if (player.velocity.x < 0) player.rotation = Math.PI
    else if (player.velocity.y > 0) player.rotation = Math.PI / 2
    else if (player.velocity.y < 0) player.rotation = Math.PI * 1.75
    
}
animate() 


addEventListener('keydown', ({key}) => {
    switch (key)
    {
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

addEventListener('keyup', ({key}) => {
    switch (key)
    {
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