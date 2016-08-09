/*

    ~*~ config options ~*~ edit me ~*~

*/

module.exports = {
    // posting to slack means it'll try to set your avatar with the file that's created
    // if true or false, it'll just save the file locally as `text_avatar.png`
    post_to_slack: true, // if false, you don't have to bother with a slack API key.
    slack_api_token: 'xxxxxx-xxx-xxxx-xxxx', // your unique Slack API token here
    width: 256, // width of the canvas to draw on; square is good for avatars
    height: 256, // height of the canvas to draw on; square is good for avatars
    which_font_file: 'font/some-font.ttf', // the TTF font file to use -- gotta use one!
    shadow_distance: 8, // the distance of the shadow from the text

    // all the texts that could be used, one will be picked at random
    // note: each array within this array _could_ be used, either 1 line or 2
    // note: if you go with 1 line, best to keep the line to 4 characters or less
    // note: if you go with 2 lines, the text will be a little bigger, so make it 3 characters or less
    potential_texts: [
        ['YAY!'], // 1 line of text, centered
        ['OH,', 'OK'], // break it up into 2 lines cuz it's cooler
        ['OH.'],
        ['OK', 'AY'],
        ['meh'],
        ['huh?'],
        ['wut'],
    ],
};