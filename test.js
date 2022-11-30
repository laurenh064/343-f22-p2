const searchButton = document.querySelector("#searchButton");
const resultContainer = document.querySelector("#resultContainer");
const column = document.querySelector("#column");

searchButton.addEventListener("click", () => {
  console.log("clicked");
  const keyword = document.querySelector("#search").value;
  fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${keyword}`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      array = data.objectIDs.slice(0, 15);
      Array.from(array).forEach((id) => {
        fetch(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
        )
          .then((response) => response.json())
          .then((data) => {
            const card = createCard(data);
            resultContainer.innerHTML += card;
          });
      });
    });
});

function createCard(data) {
  cleanData(data);
  const card = `
  <div class="card" style="width: 18rem;">
  <img src="${data.primaryImageSmall}" class="card-img-top" alt="...">
    <div class="card-body">
      <h5 class="card-title">${data.title}</h5>
      <p class="card-text">
      ${data.artistDisplayName}\n
      ${data.objectDate}
      </p>
    </div>
  </div>`;

  return card;
}

/**
 * Make sure the data is valid.
 *
 * @param {*} data
 */
function cleanData(data) {
  data.artistDisplayName =
    data.artistDisplayName == "" ? "Unknown" : data.artistDisplayName;
}

function getAuthorDetails(author) {
  fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${author}?redirect=false`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data.extract);
      // column.innerHTML += data.items[0];
    });
}
