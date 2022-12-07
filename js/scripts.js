// Get some objects
const searchButton = document.querySelector("#searchButton");
const numItemsInput = document.querySelector("#numItemsInput");
const grid = document.querySelector(".grid");
const column = document.querySelector("#column");
const modalPhoto = document.querySelector("#modal-photo");
const modalLabel = document.querySelector("#modal-label");
const palette = document.querySelector("#modal-palette");
const artInput = document.querySelector('#search');
const dropdownItems = document.querySelector('#dropdown');
let objects = [];
let showingItems = [];

var numItems = 10;

// Masonry layout
var msnry;
var msnryObj = {
  itemSelector: ".grid-item",
  columnWidth: ".grid-sizer",
  percentPosition: true,
};

// Init Masonry
imagesLoaded(grid, function () {
  // init Isotope after all images have loaded
  msnry = new Masonry(grid, {
    itemSelector: ".grid-item",
    columnWidth: ".grid-sizer",
    percentPosition: true,
  });
});

/**
 * Reset the grid.
 */
function resetMasonry() {
  const cards = document.querySelectorAll(".grid-item");
  cards.forEach((card) => {
    card.remove();
  });
  while (dropdownItems.firstChild) {
    dropdownItems.removeChild(dropdownItems.firstChild);
  }
  objects = [];
  showingItems = [];

  msnry.destroy();
  imagesLoaded(grid, function () {
    // init Isotope after all images have loaded
    msnry = new Masonry(grid, {
      itemSelector: ".grid-item",
      columnWidth: ".grid-sizer",
      percentPosition: true,
    });
  });
}

// Change num items on input change
numItemsInput.addEventListener("change", (e) => {
  numItems = e.target.value;
});

artInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchButton.click();
  }
})
searchButton.addEventListener("click", async () => {
  // clear grid
  resetMasonry();
  // get the art based on keyword
  const keyword = document.querySelector("#search").value;
  const response = await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${keyword}`
  );
  const data = await response.json();

  // create cards
  var numItems = 0;
  const array = data.objectIDs; // array of the art's IDs

  // Iterate through all objects
  for (var id of array) {
    if (numItems >= numItemsInput.value) {
      // Show max number of items
      return;
    }

    const response = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
    );
    const data = await response.json();

    if (data == null) {
      // Skip invalid data
      return;
    }
    const card = createCard(data); // Create card
    if (card != null) {
      grid.appendChild(card);
      msnry.appended(card); // Append card to masonry layout
      msnry.layout(); // readjust the layout
      numItems++;
    }
    const department = data.department;
    var valid = true;

    for (var showingItem of showingItems) {
      if (showingItem.department === department) {
        valid = false;
      }
    }
    if (valid) {
      let item = document.createElement('li');
      item.innerHTML = department;
      item.addEventListener("click", () => {

      })
      document.getElementById('dropdown').appendChild(item);
      showingItems.push(data);
    }
  }
});

function createCard(data) {
  if (!cleanData(data)) {
    // return null for invalid data
    return null;
  }
  const card = document.createElement("div");
  card.classList.add("grid-item");

  card.innerHTML = `
      <img src="${data.primaryImageSmall}" alt="${data.title}" data-bs-toggle="modal" data-bs-target="#modal">`;

  card.addEventListener("click", () => {
    // Modify modal content
    modalLabel.innerHTML = `${data.title} by ${data.artistDisplayName}`;
    modalPhoto.innerHTML = `<img src="${data.primaryImageSmall}" alt="${data.title}">`;
    getPalette(data.primaryImageSmall);
  });
  objects.push(data);
  return card;
}

/**
 * Make sure the data is valid.
 *
 * @param {*} data
 * @return {bool} true if the data is valid, false otherwise
 */
function cleanData(data) {
  if (data.primaryImageSmall == "" || data.objectID == null) {
    console.log(`Invalid object ${data.objectID}`);
    return false;
  }
  data.artistDisplayName =
    data.artistDisplayName == "" ? "Unknown" : data.artistDisplayName;
  data.title = data.title == "" ? "Untitled" : data.title;
  return true;
}

// Get the palette based off the image and display it in the modal
async function getPalette(link) {
  const response = await fetch(
    `https://api.imagga.com/v2/colors?image_url=${link}`,
    {
      headers: {
        Authorization:
          "Basic YWNjX2NiYjk5MWJkZmMzZTYzMToyN2Q0YzJiYWIxNDg5ZDUwNzVhMGU0OWY1ZDhlNTgxMA==",
      },
    }
  );
  const data = await response.json();
  palette.innerHTML = ""; // clear palette
  // Combine the foreground and background colors
  paletteArray = data.result.colors.foreground_colors.concat(
    data.result.colors.background_colors
  );
  for (var color of paletteArray) {
    palette.innerHTML += `<div class="palette-color" style="background-color: ${color.html_code};"></div>`;
  }
}
