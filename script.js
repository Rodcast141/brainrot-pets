// =====================
// PLAYER + ROLE SYSTEM
// =====================

let playerName = prompt("Enter username");

const owners = ["owner"];
const devs = ["dev"];
const mods = ["mod"];

function getRole(name) {
  if (owners.includes(name)) return "owner";
  if (devs.includes(name)) return "dev";
  if (mods.includes(name)) return "mod";
  return "player";
}

let role = getRole(playerName);

// Spawn player
let player = document.createElement("a-entity");
player.setAttribute("position", "0 1 -3");

if (role === "owner" || role === "dev" || role === "mod") {
  player.setAttribute("gltf-model", "#specialModel");
} else {
  player.setAttribute("gltf-model", "#dogModel");
  player.setAttribute("scale", "0.5 0.5 0.5");
}

// Accessories
let accessory = document.createElement("a-entity");

if (role === "owner") {
  accessory.setAttribute("geometry", "primitive: cone");
  accessory.setAttribute("color", "yellow");
  accessory.setAttribute("position", "0 1.5 0");
}

if (role === "dev") {
  accessory.setAttribute("geometry", "primitive: torus");
  accessory.setAttribute("color", "white");
  accessory.setAttribute("position", "0 1 0");
}

if (role === "mod") {
  accessory.setAttribute("geometry", "primitive: plane");
  accessory.setAttribute("color", "green");
  accessory.setAttribute("position", "0 1 0.5");
}

player.appendChild(accessory);
document.querySelector("a-scene").appendChild(player);

// =====================
// COINS SYSTEM
// =====================

let coins = 0;

function updateCoins() {
  document.querySelector("#coinsText")
    .setAttribute("value", "Coins: " + coins);
}

// =====================
// CRYSTALS (SPAWN SYSTEM)
// =====================

function spawnCrystal(x, z) {
  let crystal = document.createElement("a-cone");

  crystal.setAttribute("position", `${x} 1 ${z}`);
  crystal.setAttribute("color", "cyan");

  crystal.addEventListener("click", () => {
    coins += 10;
    updateCoins();

    let pos = crystal.getAttribute("position");

    crystal.remove();

    setTimeout(() => {
      spawnCrystal(pos.x, pos.z);
    }, 60000);
  });

  document.querySelector("a-scene").appendChild(crystal);
}

// spawn 5 crystals
for (let i = 0; i < 5; i++) {
  spawnCrystal((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
}

// =====================
// WORLD SYSTEM
// =====================

document.querySelector("#toWorld2").onclick = () => {
  if (coins >= 50) {
    document.querySelector("#world1").setAttribute("visible", false);
    document.querySelector("#world2").setAttribute("visible", true);
  } else {
    alert("Need 50 coins!");
  }
};

document.querySelector("#toWorld1").onclick = () => {
  document.querySelector("#world1").setAttribute("visible", true);
  document.querySelector("#world2").setAttribute("visible", false);
};

// =====================
// EGG SYSTEM (RARITY + TIER)
// =====================

const eggTiers = {
  1: {
    cost: 10,
    rewards: [
      { name: "Frog", rarity: "Common", tier: 1, chance: 0.7 },
      { name: "Croc", rarity: "Rare", tier: 1, chance: 0.3 }
    ]
  }
};

function openEgg(tier) {
  let egg = eggTiers[tier];

  if (coins < egg.cost) {
    alert("Not enough coins!");
    return;
  }

  coins -= egg.cost;
  updateCoins();

  let rand = Math.random();
  let total = 0;

  for (let reward of egg.rewards) {
    total += reward.chance;
    if (rand <= total) {
      alert(`You got: ${reward.rarity} Tier ${reward.tier} ${reward.name}`);
      break;
    }
  }
}

document.querySelector("#eggT1").onclick = () => openEgg(1);
