// Get some objects
const searchButton = document.querySelector("#searchButton");
const grid = document.querySelector(".grid");
const column = document.querySelector("#column");

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
    if (numItems >= 5) {
      // Show max 15 items
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
  }
});

const modalBody = document.querySelector(".modal-body");
const modalLabel = document.querySelector("#modal-label");

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
    modalBody.innerHTML = `<img src="${data.primaryImageSmall}" alt="${data.title}">`;
  });
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

// Get palette
// fetch(
//   "https://api.imagga.com/v2/colors?image_url=https://images.metmuseum.org/CRDImages/ep/web-large/DP346474.jpg",
//   {
//     headers: {
//       Authorization:
//         "Basic YWNjX2NiYjk5MWJkZmMzZTYzMToyN2Q0YzJiYWIxNDg5ZDUwNzVhMGU0OWY1ZDhlNTgxMA==",
//     },
//   }
// )
//   .then((response) => response.json())
//   .then((data) => {
//     console.log(data.result.colors);
//     for (var color of data.result.colors.foreground_colors) {
//       column.innerHTML += `<div style="background-color: ${color.html_code}; width: 100px; height: 100px;"></div>`;
//     }
//   });
