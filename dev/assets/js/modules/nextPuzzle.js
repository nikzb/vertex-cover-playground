const setUpClickHandlersForNextGraphLinks = function setUpClickHandlersForNextGraphLinks(messageBox) {
  const domain = window.location.host;
  const nextGraphLinks = document.querySelectorAll('.next-graph');

  console.log('setting up next graph links');

  nextGraphLinks.forEach((link) => {
    link.addEventListener('click', () => {
      messageBox.show('selectGraphSize', 0);
    });

    // link.addEventListener("click", () => {
    //   // Need to get a puzzle that hasn't been attempted yet based on what is in localStorage
    //   const puzzleListString = localStorage.getItem('hotspotPuzzlesAttempted');
    //
    //   const myHeaders = new Headers({
    //     'Content-Type': 'application/json'
    //   });
    //
    //   const myInit = {
    //     method: 'POST',
    //     headers: myHeaders,
    //     body: puzzleListString
    //   };
    //
    //   const myRequest = new Request(`//${domain}/get-random-hotspot/`, myInit);
    //
    //   fetch(myRequest)
    //     .then(
    //       (response) => {
    //         response.text().then((code) => {
    //           if (code) {
    //             // This would work except then I would need to also update the graph code that shows up
    //             // usePuzzle(code);
    //             // Reload the page so that the code in the URL and the code shown on the page match the puzzle shown
    //             // window.location=`http://${domain}/hotspot/${code}`;
    //             window.location=`//${domain}/hotspot/${code}`;
    //           }
    //         })
    //         .catch((error) => {
    //           throw new Error(error);
    //         });
    //       }
    //     )
    //     .catch((error) => {
    //       throw new Error(error);
    //     });
    // });
  });
};

module.exports = setUpClickHandlersForNextGraphLinks;
