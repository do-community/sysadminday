document.addEventListener('DOMContentLoaded', () => {
    // Find all the links for YouTube videos
    const links = document.querySelectorAll('a[href^="https://www.youtube.com/watch?v="],a[href^="https://youtu.be/"]');
    for (const link of links) {
        link.addEventListener('click', event => {
            event.preventDefault();
            const modal = document.createElement('dialog');

            // Allow the user to close the modal via the background
            const close = event => {
                event.preventDefault();
                modal.close();
                modal.remove();
            };
            modal.addEventListener('click', close);

            // Allow the user to close the modal via button
            const button = document.createElement('button');
            button.addEventListener('click', close);
            modal.appendChild(button);

            // Allow the user to close the modal via escape
            const escape = event => {
                if (event.key !== 'Escape') return;
                close(event);
                document.removeEventListener('keydown', escape);
            };
            document.addEventListener('keydown', escape);

            // Inject the YouTube video
            const iframe = document.createElement('iframe');
            const videoId = link.href.match(/^https:\/\/(?:www\.youtube\.com\/watch\?v=|youtu\.be\/)(.+)$/)[1];
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            iframe.frameborder = 0;
            modal.appendChild(iframe);

            document.body.appendChild(modal);
            modal.show();
        });
    }
});
