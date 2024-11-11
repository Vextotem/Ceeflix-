// Function to update the Continue3Js section
function updateContinueSection() {
    const continueSection = document.getElementById('Continue2');
    let continueEpisodes = JSON.parse(localStorage.getItem('continueEpisodes')) || [];

    let CONTINUE_HTML = "";

    if (continueEpisodes.length === 0) {
        CONTINUE_HTML = "<p>&nbsp; </pa><p style='color: white;'>You haven't watched anything yet 😔</p>";
    } else {
        continueEpisodes.forEach((anime, animePos) => {
            let { animeId, title, image, episode } = anime;
            let { episodeId, episodeNumber } = episode;
            let url = `./episode.html?anime_id=${animeId}&episode_id=${episodeId}`;

            CONTINUE_HTML += `
                <div class="poster la-anime" style="position: relative;">
                    <a href="${url}">
                        <div id="shadow1" class="shadow">
                            <div class="dubb">Episode ${episodeNumber}</div>
                        </div>
                        <div id="shadow2" class="shadow"> 
                            <img class="lzy_img" src="${image}" onerror="this.src='${image}'">
                        </div>
                        <div class="la-details"> 
                            <h3>${title}</h3>
                        </div>
                    </a>
                </div>`;
        });
    }

    continueSection.innerHTML = CONTINUE_HTML;
}


// Call the function to update the continue section when the page loads
document.addEventListener('DOMContentLoaded', updateContinueSection);
