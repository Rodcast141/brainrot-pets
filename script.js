let playerName = prompt("Enter username") || "player";

const owners = ["owner"];
const devs = ["dev", "rusty.gamer32"];
const mods = ["mod"];

function getRole(name) {
  if (owners.includes(name)) return "owner";
  if (devs.includes(name)) return "dev";
  if (mods.includes(name)) return "mod";
  return "player";
}

let role = getRole(playerName);

let coins = 0;
let pets = [];
let level = 0;
let sleepLevel = 0;
let tutorialStep = 0;

function updateCoins() {
  document.querySelector("#coinsText")
    .setAttribute("value", "Coins: " + coins);
}

function updateLeaderboard() {
  document.querySelector("#rebirthBoard")
    .setAttribute("value",
`Level: ${level}
Coins Needed: 350k
Pet Needed: Cameraman`);
}

function updateTutorial() {
  let text = document.querySelector("#tutorialText");

  if (tutorialStep === 0) text.setAttribute("value", "💎 Mine crystals");
  else if (tutorialStep === 1) text.setAttribute("value", "🚪 Go to tunnel");
  else if (tutorialStep === 2) text.setAttribute("value", "🥚 Hatch egg");
  else if (tutorialStep === 3) text.setAttribute("value", "🔁 Rebirth");
  else text.setAttribute("value", "🎉 Done!");
}

window.onload = () => {

  let scene = document.querySelector("a-scene");

  // PLAYER
  let player = document.createElement("a-entity");

  if (role === "dev" || role === "owner" || role === "mod") {
    player.setAttribute("gltf-model", "#proDog");
  } else {
    player.setAttribute("gltf-model", "#normalDog");
  }

  player.setAttribute("position", "0 1 -3");
  scene.appendChild(player);

  // CRYSTALS
  document.querySelectorAll(".crystal").forEach(c => {
    c.addEventListener("click", () => {
      coins += 5;
      updateCoins();

      if (tutorialStep === 0) {
        tutorialStep = 1;
        updateTutorial();
      }
    });
  });

  // TUNNEL
  document.querySelector("#tunnelDoor").onclick = () => {
    document.querySelector("#world1").setAttribute("visible", false);
    document.querySelector("#plantWorld").setAttribute("visible", true);

    if (tutorialStep === 1) {
      tutorialStep = 2;
      updateTutorial();
    }
  };

  // PET SPAWN
  function spawnPet(type) {
    let pet = document.createElement("a-entity");

    pet.setAttribute("gltf-model", "#adminPet");
    pet.setAttribute("scale", "0.3 0.3 0.3");

    scene.appendChild(pet);

    setInterval(() => {
      let pos = document.querySelector("#camera").getAttribute("position");

      pet.setAttribute("position", {
        x: pos.x,
        y: 0.5,
        z: pos.z - 1
      });
    }, 200);
  }

  // EGGS
  document.querySelectorAll(".egg").forEach(e => {
    e.addEventListener("click", () => {
      e.setAttribute("visible", false);

      pets.push("cameraman");
      spawnPet();

      if (tutorialStep === 2) {
        tutorialStep = 3;
        updateTutorial();
      }
    });
  });

  // BED + BUFF
  document.addEventListener("keydown", (e) => {
    if (e.key === "b") {
      let bed = document.createElement("a-box");

      let pos = document.querySelector("#camera").getAttribute("position");

      bed.setAttribute("position", `${pos.x} 0 ${pos.z - 2}`);
      bed.setAttribute("color", "brown");

      bed.onclick = () => {
        sleepLevel++;

        if (sleepLevel === 1) alert("💪 6 PACK");
        else if (sleepLevel === 2) alert("💪 8 PACK");
        else alert("💪 10 PACK");
      };

      scene.appendChild(bed);
    }
  });

  // REBIRTH
  document.querySelector("#rebirthButton").onclick = () => {

    if (coins < 350000) return alert("Need 350k coins");
    if (!pets.includes("cameraman")) return alert("Need Cameraman");

    level++;
    coins = 0;
    pets = [];

    alert("🔥 LEVEL UP");

    updateCoins();
    updateLeaderboard();

    if (tutorialStep === 3) {
      tutorialStep = 4;
      updateTutorial();
    }
  };

  updateCoins();
  updateLeaderboard();
  updateTutorial();
};
