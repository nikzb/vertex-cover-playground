const loadGraph = function loadGraph(domain, size) {
  console.log('in load graph');
  console.log(domain);
  console.log(size);
  // const domain = window.location.host;
  // Need to get a puzzle that hasn't been attempted yet based on what is in localStorage
  const puzzleListString = localStorage.getItem('hotspotPuzzlesAttempted');

  const myHeaders = new Headers({
    'Content-Type': 'application/json'
  });

  const myInit = {
    method: 'POST',
    headers: myHeaders,
    body: puzzleListString
  };

  console.log(domain);
  const myRequest = new Request(`//${domain}/get-hotspot-given-size/${size}`, myInit);
  fetch(myRequest)
    .then(
      (response) => {
        response.text().then((code) => {
          console.log(code);
          if (code) {
            // This would work except then I would need to also update the graph code that shows up
            // usePuzzle(code);
            // Reload the page so that the code in the URL and the code shown on the page match the puzzle shown
            // window.location=`http://${domain}/hotspot/${code}`;
            window.location=`//${domain}/hotspot/${code}`;
          }
        })
        .catch((error) => {
          throw new Error(error);
        });
      }
    )
    .catch((error) => {
      throw new Error(error);
    });
};

const setUpClickHandlersForNextGraphLinks = function setUpClickHandlersForNextGraphLinks(messageBox, domain) {
  const nextGraphLinks = document.querySelectorAll('.next-graph');

  nextGraphLinks.forEach((link) => {
    link.addEventListener('click', () => {
      messageBox.show('selectGraphSize', 0);
    });
  });

  const smallPuzzleButton = document.querySelector('.graph-area__options--small');
  const mediumPuzzleButton = document.querySelector('.graph-area__options--medium');
  const largePuzzleButton = document.querySelector('.graph-area__options--large');
  const xLargePuzzleButton = document.querySelector('.graph-area__options--x-large');

  smallPuzzleButton.addEventListener('click', () => {
    loadGraph(domain, 'small');
  });

  mediumPuzzleButton.addEventListener('click', () => {
    loadGraph(domain, 'medium');
  });

  largePuzzleButton.addEventListener('click', () => {
    loadGraph(domain, 'large');
  });

  xLargePuzzleButton.addEventListener('click', () => {
    loadGraph(domain, 'x-large');
  });
};

module.exports = setUpClickHandlersForNextGraphLinks;
