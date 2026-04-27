// Variabili globali per la fisica, telecamera e stato del gioco
var cameraX = 0;
var gravity = 0.6;
var friction = 0.8;
var livelloMax = 4760; // Lunghezza totale del livello modificata per l'esempio fisso
var isGameOver = false;
var keys = { ArrowRight: false, ArrowLeft: false, ArrowUp: false };

// Ascolto degli eventi della tastiera
window.addEventListener('keydown', function(e) {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
});
window.addEventListener('keyup', function(e) {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
});

var animatedObject = {
  speedX: 0,
  speedY: 0,
  width: 40,
  height: 40,
  x: 50,
  y: 100,
  jumpPower: -13,
  grounded: false,
  imageList: [],
  contaFrame: 0,
  actualFrame: 0,
  image: null,

  update: function() {
    if (isGameOver) return; 

    // 1. Gestione Input
    if (keys.ArrowRight) this.speedX += 1.2; 
    if (keys.ArrowLeft) this.speedX -= 1.2;
    if (keys.ArrowUp && this.grounded) {
        this.speedY = this.jumpPower;
        this.grounded = false;
    }

    // 2. Fisica
    this.speedX *= friction;
    this.speedY += gravity;
    this.x += this.speedX;
    this.y += this.speedY;

    // 3. Logica della Telecamera (Scrolling)
    if (this.x > cameraX + myGameArea.canvas.width / 2.5) {
        cameraX = this.x - myGameArea.canvas.width / 2.5;
    }
    // Muro invisibile a sinistra
    if (this.x < cameraX) {
        this.x = cameraX;
        this.speedX = 0;
    }

    // 4. Animazione Sprite
    this.contaFrame++;
    if (this.contaFrame == 7 && this.imageList.length > 0) {
      this.contaFrame = 0;
      this.actualFrame = (1 + this.actualFrame) % this.imageList.length;
      this.image = this.imageList[this.actualFrame];
    }
  },

  loadImages: function() {
     if (typeof Mario !== 'undefined') {
         for (let imgPath of Mario) { 
           var img = new Image(this.width, this.height);
           img.src = imgPath;
           this.imageList.push(img);
         }
         this.image = this.imageList[this.actualFrame];
     }
  }
};

var myObstacles = [];
var myScore;

function startGame() {
    myGameArea.start();
    myScore = new component("20px", "Consolas", "white", 10, 30, "text");

    // --- GENERATORE DI LIVELLI FISSO (LEVEL DESIGN MANUALE) ---
    // Altezza standard del pavimento
    let groundY = myGameArea.canvas.height - 50; 

    // Parametri: component(larghezza, altezza, colore, posizione_X, posizione_Y, tipo)

    // --- SEZIONE 1: Inizio tranquillo ---
    myObstacles.push(new component(800, 50, "#228B22", 0, groundY, "rect")); // Prato iniziale lungo 800
    myObstacles.push(new component(50, 60, "#32CD32", 300, groundY - 60, "rect")); // Tubo 1
    myObstacles.push(new component(70,-20, "#32CD32",290, groundY -40, "rect"))
    myObstacles.push(new component(120, 20, "#8B4513", 500, groundY - 120, "rect")); // Piattaforma sospesa 1
    myObstacles.push(new component(50, 90, "#32CD32", 700, groundY - 90, "rect")); // Tubo 2 (più alto)
    myObstacles.push(new component(70,-20, "#32CD32",690, groundY -70, "rect"))

    // --- FOSSATO 1 --- (Da X: 800 a X: 950 c'è il vuoto)

    // --- SEZIONE 2: I salti continui ---
    myObstacles.push(new component(600, 50, "#228B22", 950, groundY, "rect")); // Riprende il prato
    myObstacles.push(new component(120, 20, "#8B4513", 1100, groundY - 100, "rect")); 
    myObstacles.push(new component(120, 20, "#8B4513", 1300, groundY - 180, "rect")); // Piattaforma più alta
    myObstacles.push(new component(50, 40, "#32CD32", 1450, groundY - 40, "rect")); // Tubo basso prima del buco
    myObstacles.push(new component(70,-20, "#32CD32",1440, groundY - 20, "rect"))

    // --- FOSSATO 2 --- (Da X: 1550 a X: 1750 c'è il vuoto)

    // --- SEZIONE 2: Zona Ostacoli Extra (1700 - 3500) ---
    myObstacles.push(new component(1000, 50, "#228B22", 1700, groundY, "rect")); 
    myObstacles.push(new component(50, 120, "#32CD32", 1900, groundY - 120, "rect")); // Tubo molto alto
    myObstacles.push(new component(70,-20, "#32CD32",1890, groundY - 100, "rect"))
    myObstacles.push(new component(150, 20, "#8B4513", 2100, groundY - 100, "rect"));
    myObstacles.push(new component(150, 20, "#8B4513", 2300, groundY - 200, "rect")); // Salto in alto
    myObstacles.push(new component(50, 150, "#32CD32", 2550, groundY - 150, "rect")); // Ostacolo alto
    myObstacles.push(new component(70,-20, "#32CD32",2540, groundY - 130, "rect"))
    
    // Altro prato dopo un buco
    myObstacles.push(new component(800, 50, "#228B22", 2800, groundY, "rect"));
    myObstacles.push(new component(40, 40, "#8B4513", 3000, groundY - 40, "rect")); // Blocco singolo
    myObstacles.push(new component(40, 40, "#8B4513", 3100, groundY - 80, "rect"));
    myObstacles.push(new component(40, 40, "#8B4513", 3200, groundY - 120, "rect"));

    // --- SEZIONE 3: La Sfida Finale e la Scalinata (3700 - 4800) ---
    myObstacles.push(new component(1200, 50, "#228B22", 3700, groundY, "rect")); // Terreno finale

    // Creazione della SCALINATA stile Mario
    let stairX = 4100;
    let stairSize = 40;
    for (let i = 1; i <= 6; i++) {
        // Disegna una colonna di blocchi che aumenta di altezza
        myObstacles.push(new component(stairSize, stairSize * i, "#8B4513", stairX + (i * stairSize), groundY - (i * stairSize), "rect"));
    }
    
    // Piattaforma d'arrivo in cima alla scalinata
    let topPlatformX = stairX + (7 * stairSize);
    let topPlatformY = groundY - (6 * stairSize);
    myObstacles.push(new component(200, 6 * stairSize, "#8B4513", topPlatformX, topPlatformY, "rect"));

    // --- TRAGUARDO (Rialzato sopra la scalinata) ---
    // L'asta ora parte dal livello della piattaforma (topPlatformY)
    myObstacles.push(new component(10, 400, "#FFD700", livelloMax+40, topPlatformY - 140, "rect")); 
    
    // Castello finale a terra, dopo la scalinata
    myObstacles.push(new component(1000, 50, "#228B22", livelloMax - 100, groundY, "rect")); // Terreno sotto il castello
    myObstacles.push(new component(150, 180, "#8B4513", livelloMax + 200, groundY - 180, "rect")); // Castello più grande
    myObstacles.push(new component(30, 40, "#FFD700", livelloMax + 260, groundY - 220, "rect")); // Bandierina sul castello
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        animatedObject.loadImages();  
        // 1. Modifica dimensione Canvas a 3/4 dello schermo (75%)
        this.canvas.width = window.innerWidth * 0.75;
        this.canvas.height = window.innerHeight * 0.75;
        // Colore rimosso da qui perché gestito nel CSS per comodità, ma se serve forzarlo:
        this.canvas.style.backgroundColor = "#6495ED"; 
        
        this.context = this.canvas.getContext("2d");
        // Inserisce la canva dentro al body, ma ora il CSS si occupa di centrarla
        document.body.appendChild(this.canvas);
        
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
    },
    drawGameObject: function(gameObject) {
        if (gameObject.image) {
            this.context.drawImage(
              gameObject.image,
              gameObject.x - cameraX, 
              gameObject.y,
              gameObject.width,
              gameObject.height
            );
        } else {
            this.context.fillStyle = "#FF4500"; 
            this.context.fillRect(gameObject.x - cameraX, gameObject.y, gameObject.width, gameObject.height);
            // Bordo cartoon anche per il giocatore senza sprite
            this.context.lineWidth = 3;
            this.context.strokeStyle = "black";
            this.context.strokeRect(gameObject.x - cameraX, gameObject.y, gameObject.width, gameObject.height);
        }
    }
}

function component(width, height, color, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.color = color;
    this.x = x;
    this.y = y;    

    this.update = function() {
        var ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = this.color;
            // Ombreggiatura sul testo per renderlo più leggibile e cartoon
            ctx.shadowColor = "black";
            ctx.shadowBlur = 4;
            ctx.fillText(this.text, this.x, this.y); 
            // Resetta l'ombra per non applicarla agli ostacoli
            ctx.shadowBlur = 0;
        } else {
            // Disegna il colore interno
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
            
            // 2. Grafica: Aggiunge il contorno NERO SPESSO stile cartoon
            ctx.lineWidth = 3; // Spessore della linea
            ctx.strokeStyle = '#000000'; // Colore nero assoluto (non più trasparente)
            ctx.strokeRect(this.x - cameraX, this.y, this.width, this.height);
        }
    }
}

function updateGameArea() {
    if (isGameOver) return; 

    myGameArea.clear();
    animatedObject.update();

    // 1. Condizione di Vittoria
    if (animatedObject.x >= livelloMax) {
        isGameOver = true;
        myGameArea.stop();
        myScore.text = "🏆 HAI VINTO! 🏆";
        myScore.x = myGameArea.canvas.width / 2 -180; // Centrato nello schermo nuovo
        myScore.y = myGameArea.canvas.height / 2;
        myScore.width = "40px";
        myScore.update();
        return;
    }

    // 2. Condizione di Sconfitta
    if (animatedObject.y > myGameArea.canvas.height) {
        isGameOver = true;
        myGameArea.stop();
        myScore.text = "💀 GAME OVER 💀";
        myScore.color = "#ff4757"; // Un rosso più gradevole
        myScore.x = myGameArea.canvas.width / 2 -180;
        myScore.y = myGameArea.canvas.height / 2;
        myScore.width = "40px";
        myScore.update();
        return;
    }

    // Rilevamento Collisioni (invariato, funzionava già bene)
    animatedObject.grounded = false;
    for (let i = 0; i < myObstacles.length; i++) {
        let plat = myObstacles[i];
        
        if (animatedObject.x < plat.x + plat.width &&
            animatedObject.x + animatedObject.width > plat.x &&
            animatedObject.y < plat.y + plat.height &&
            animatedObject.y + animatedObject.height > plat.y) {
            
            // Atterraggio
            if (animatedObject.speedY > 0 && animatedObject.y + animatedObject.height - animatedObject.speedY <= plat.y) {
                animatedObject.grounded = true;
                animatedObject.speedY = 0;
                animatedObject.y = plat.y - animatedObject.height;
            }
            // Testata sotto il blocco
            else if (animatedObject.speedY < 0 && animatedObject.y - animatedObject.speedY >= plat.y + plat.height) {
                animatedObject.speedY = 0;
                animatedObject.y = plat.y + plat.height;
            }
            // Muro a Destra
            else if (animatedObject.speedX > 0 && animatedObject.x + animatedObject.width - animatedObject.speedX <= plat.x) {
                animatedObject.speedX = 0;
                animatedObject.x = plat.x - animatedObject.width;
            }
            // Muro a Sinistra
            else if (animatedObject.speedX < 0 && animatedObject.x - animatedObject.speedX >= plat.x + plat.width) {
                animatedObject.speedX = 0;
                animatedObject.x = plat.x + plat.width;
            }
        }
    }

    // Disegna ostacoli
    for (let i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].update();
    }
    
    // Disegna giocatore
    myGameArea.drawGameObject(animatedObject);

    // Testo UI (Punteggio/Distanza rimanente)
    let distanzaRimanente = Math.floor(livelloMax - animatedObject.x);
    myScore.text = "Obiettivo a: " + (distanzaRimanente > 0 ? distanzaRimanente : 0) + "m";
    myScore.x = 10;
    myScore.y = 30;
    myScore.width = "20px";
    myScore.color = "white";
    myScore.update();
}

// Funzioni per bottoni touch
function moveup() { keys.ArrowUp = true; }
function moveleft() { keys.ArrowLeft = true; }
function moveright() { keys.ArrowRight = true; }
function clearmove() { keys.ArrowUp = false; keys.ArrowLeft = false; keys.ArrowRight = false; }