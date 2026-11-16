/* =========================================================
   Eclipse Entertainment – Food & Drinks data (food-drinks.html)
   Edit products, prices, photos, pairings and popcorn options here.
   Prices are EXAMPLES: change them to the real ones.

   PHOTOS: every product and combo has its own "photo".
   To change a photo, put the new image in the images folder
   and change the file name on that line (exact name + extension).
   ========================================================= */

/* ---------- FALLBACK PHOTO ----------
   Used when a product or combo has no photo, or the file is missing */
const DEFAULT_PHOTO = "images/poster.jpg";

/* ---------- SNACK MOODS (the filter buttons) ---------- */
const MOODS = [
  { id: "all", label: "Everything", icon: "✨" },
  { id: "sweet", label: "Sweet", icon: "🍫" },
  { id: "salty", label: "Salty", icon: "🧂" },
  { id: "spicy", label: "Spicy", icon: "🌶️" },
  { id: "fresh", label: "Fresh", icon: "🥗" },
  { id: "share", label: "Share", icon: "👨‍👩‍👧" }
];

/* ---------- MENU ----------
   photo: image file for this product
   moods: which mood buttons show this item
   tag:   optional small label ("NEW", "HOT", "21+", "KIDS")
*/
const MENU = [
  { id: "nachos", name: "Loaded Nachos", desc: "Tortilla chips with melted cheddar, seasoned beef, jalapeños, black olives and tomatoes.", price: 11, icon: "🧀", photo: "images/Loaded-Nachos-Cheese-Pull.jpg", moods: ["salty", "spicy", "share"] },
  { id: "burger", name: "Eclipse Burger", desc: "Smash patty, melted cheddar, onion and our house sauce on a toasted brioche bun.", price: 14.5, icon: "🍔", photo: "images/burger.jpg", moods: ["salty"] },
  { id: "flatbread", name: "Pepperoni Flatbread", desc: "Stone-baked flatbread with mozzarella, crispy pepperoni and oregano.", price: 13, icon: "🍕", photo: "images/pizza.jpg", moods: ["salty", "share"] },
  { id: "wings", name: "Buffalo Bites", desc: "Crispy boneless bites tossed in buffalo sauce, with blue cheese dip, celery and carrots.", price: 12.5, icon: "🍗", photo: "images/wings.jpg", moods: ["spicy", "share"], tag: "HOT" },
  { id: "tacos", name: "Street Tacos", desc: "Grilled steak tacos on corn tortillas with onion, cilantro and lime.", price: 11.5, icon: "🌮", photo: "images/tacos.jpg", moods: ["spicy", "salty"] },
  { id: "bowl", name: "Garden Bowl", desc: "Wild rice, chickpeas, radish, greens and pumpkin seeds with a light dressing.", price: 10, icon: "🥗", photo: "images/garden bowl.jpg", moods: ["fresh"] },
  { id: "share-box", name: "Family Share Box", desc: "Pretzel bites with cheese, chicken nuggets, a pepperoni pizza, large popcorn and two drinks.", price: 34, icon: "🍱", photo: "images/family share.jpeg", moods: ["salty", "share"], tag: "NEW" },
  { id: "kids-combo", name: "Kids Combo", desc: "Mario cup with a drink, popcorn, a Ring Pop and an Airheads bar.", price: 9.5, icon: "🧃", photo: "images/kids combo.jpg", moods: ["sweet", "salty"], tag: "KIDS" },
  { id: "fruit", name: "Fruit Cup", desc: "Fresh strawberries, kiwi, pineapple and mango.", price: 6, icon: "🍓", photo: "images/Tropical-Fruit-Cups-picture.jpg", moods: ["fresh", "sweet"] },
  { id: "soda", name: "Fountain Soda", desc: "Large cup with free refills. Pick your flavor at the counter.", price: 5.5, icon: "🥤", photo: "images/soda-fountain-taste-.jpg", moods: ["sweet"] },
  { id: "lemonade", name: "Pink Lemonade", desc: "Sparkling pink lemonade over ice with a slice of lime.", price: 6, icon: "🍋", photo: "images/lemonade.jpg", moods: ["fresh", "sweet"] },
  { id: "milkshake", name: "Galaxy Milkshake", desc: "Purple and blue swirl shake with whipped cream, sprinkles and a star cookie.", price: 7.5, icon: "🥛", photo: "images/milkshake.jpg", moods: ["sweet"], tag: "NEW" },
  { id: "cocktail", name: "Eclipse Cocktail", desc: "Our signature raspberry cocktail with fresh mint.", price: 12, icon: "🍹", photo: "images/cocktail.webp", moods: ["sweet", "fresh"], tag: "21+" },
  { id: "beer", name: "Draft Beer", desc: "Ask your server for today's local taps.", price: 8, icon: "🍺", photo: "images/beer.jpg", moods: ["fresh"], tag: "21+" },
  { id: "candy", name: "Candy Mix", desc: "Build your own bag: Twizzlers, Skittles, Airheads, Life Savers gummies and more.", price: 5, icon: "🍬", photo: "images/candy mix.jpg", moods: ["sweet", "share"] },
  { id: "brownie", name: "Fudge Brownies", desc: "Warm, gooey chocolate fudge brownies.", price: 7, icon: "🍫", photo: "images/Brownies.jpg", moods: ["sweet"] },
  { id: "churros", name: "Churro Bites", desc: "Cinnamon sugar churros with dulce de leche dip.", price: 6.5, icon: "🍩", photo: "images/churros.jpg", moods: ["sweet", "share"] }
];

/* ---------- MOVIE PAIRINGS (combos) ----------
   Key = movie id from movie-list.js.
   "default" is used for any movie without its own pairing.
*/
const PAIRINGS = {
  "garfield": {
    name: "Garfield Collector Combo", icon: "🐱", price: 32, photo: "images/garfield combo.jpeg",
    includes: ["Garfield popcorn bucket", "Garfield hooded blanket", "2 collectible cups"],
    note: "Lazy movie night, Garfield style: snacks, a cozy blanket and zero Mondays."
  },
  "wonka": {
    name: "Wonka's Wonderous Combo", icon: "🍫", price: 18.5, photo: "images/wonka combo.jpg",
    includes: ["Large popcorn in a Wonka bucket", "Large drink in a Wonka cup", "Candy topping"],
    note: "Pure imagination… with candy on top."
  },
  "spider-man": {
    name: "Spider-Man Web Combo", icon: "🕷️", price: 29, photo: "images/spiderman combo.jpg",
    includes: ["Spider-Man combo container", "Popcorn tub with lid", "32 oz Spider-Man bottle", "Free same-day refill"],
    note: "Your friendly neighborhood combo, with free refills all day."
  },
  "godzilla-x-kong": {
    name: "Godzilla x Kong Collector Combo", icon: "🦖", price: 26, photo: "images/godzilla vs kong combo.jpg",
    includes: ["Collector popcorn bucket", "Cup with Godzilla topper", "Kong character topper"],
    note: "Titan-sized collectibles. While supplies last."
  },
  "mario-bros": {
    name: "Mario Galaxy Collector Combo", icon: "🍄", price: 30, photo: "images/mario bros combo.jpg",
    includes: ["Yoshi popcorn bucket", "Luma LED popcorn bucket", "Mario Galaxy 44 oz cup"],
    note: "Collect them all: Yoshi, Lumas and more."
  },
  "batman": {
    name: "Bat-Signal Combo", icon: "🦇", price: 28, photo: "images/batman.jpg",
    includes: ["Bat-Signal popcorn bucket", "Large popcorn", "Batmobile collectible cup", "Large drink"],
    note: "Celebrating 85 years of Batman. Light up the night."
  },
  "jaws": {
    name: "Shark Bite Basket", icon: "🦈", price: 16.5, photo: "images/jwas.jpg",
    includes: ["Fish & chips", "Ocean blue lemonade"],
    note: "You're gonna need a bigger basket."
  },
  "007": {
    name: "Shaken, Not Stirred", icon: "🍸", price: 18,
    includes: ["Signature martini (or mocktail)", "Truffle fries"],
    note: "Licensed to snack."
  },
  "pirates-of-the-caribbean": {
    name: "Captain's Treasure", icon: "🏴‍☠️", price: 18.5,
    includes: ["Rum-glazed wings", "Pineapple soda", "Gold chocolate coins"],
    note: "Treasure found. No map needed."
  },
  "elemental": {
    name: "Four Elements Platter", icon: "🔥", price: 21,
    includes: ["Spicy wings (fire)", "Lemonade (water)", "Fries (earth)", "Cotton candy (air)"],
    note: "One bite of each element."
  },
  "default": {
    name: "Classic Movie Night", icon: "🍿", price: 15,
    includes: ["Large butter popcorn", "Fountain soda", "Candy mix"],
    note: "The combo that never misses."
  }
};

/* ---------- BUILD YOUR POPCORN ---------- */
const POPCORN = {
  sizes: [
    { id: "S", name: "Small", price: 6, scale: 0.72 },
    { id: "M", name: "Medium", price: 7.5, scale: 0.84 },
    { id: "L", name: "Large", price: 9, scale: 0.94 },
    { id: "XL", name: "XL", price: 11, scale: 1 }
  ],
  maxFlavors: 3,
  extraFlavorPrice: 1,   // first flavor is free, each extra costs this
  flavors: [
    { id: "butter", name: "Butter", color: "#f6d56a" },
    { id: "caramel", name: "Caramel", color: "#c98231" },
    { id: "cheddar", name: "Cheddar", color: "#f39a2c" },
    { id: "chocolate", name: "Chocolate", color: "#6d3d24" },
    { id: "chili", name: "Chili Lime", color: "#d9462b" },
    { id: "truffle", name: "Black Truffle", color: "#3b3640" }
  ],
  toppings: [
    { id: "drizzle", name: "Chocolate drizzle", price: 1.5, color: "#4a2616" },
    { id: "candies", name: "Candy pieces", price: 1.5, color: "multi" },
    { id: "marshmallow", name: "Mini marshmallows", price: 1, color: "#ffffff" },
    { id: "salt", name: "Sea salt", price: 0, color: "#e9e6ef" }
  ]
};

/* ---------- DELIVERY ---------- */
const TRAILERS_MINUTES = 20;   // trailers start this many minutes before the movie