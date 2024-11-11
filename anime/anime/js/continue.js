// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Fetch anime details from the API
async function fetchAnimeDetails(animeId) {
    const response = await fetch(`https://api.notowner.workers.dev/anime/${animeId}`);
    const data = await response.json();
    return data.results;
}

// Store the anime and episode details in localStorage
async function storeEpisodeDetails() {
    const animeId = getUrlParameter('anime_id');
    const episodeId = getUrlParameter('episode_id');

    if (animeId && episodeId) {
        const animeDetails = await fetchAnimeDetails(animeId);

        if (animeDetails) {
            const { name: animeTitle, image: animeImage } = animeDetails;
            let continueEpisodes = JSON.parse(localStorage.getItem('continueEpisodes')) || [];

            // Check if the anime ID already exists
            const existingAnimeIndex = continueEpisodes.findIndex(item => item.animeId === animeId);

            const episodeDetails = {
                animeId: animeId,
                episodeId: episodeId,
                title: animeTitle,
                image: animeImage,
                episodeNumber: episodeId.split('-').pop() // get episode number from episodeId
            };

            if (existingAnimeIndex !== -1) {
                // Replace the existing episode details
                continueEpisodes[existingAnimeIndex].episode = episodeDetails;
            } else {
                // Add new anime with its first episode
                continueEpisodes.push({
                    animeId: animeId,
                    title: animeTitle,
                    image: animeImage,
                    episode: episodeDetails
                });
            }

            localStorage.setItem('continueEpisodes', JSON.stringify(continueEpisodes));
        }
    }
}

// Call the function to store the episode details when the page loads
document.addEventListener('DOMContentLoaded', storeEpisodeDetails);
