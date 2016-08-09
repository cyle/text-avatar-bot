/*

    this is a dumb "bot" (it's really just a script right now) that takes potential words/phrases
    and makes a pretty word art image out of one of them
    and then makes it your avatar in slack

    :thumbsup: :ok_hand: :100:

*/

// node libs
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

// external libs
const Canvas = require('canvas');
const Font = Canvas.Font;

if (!Font) {
    throw new Error('Whoooops, need to compile canvas with font support!');
}

// wow what a great helper function
function random_from_array(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// load config
var config = require('./config.js');
var slack_api_token = config.slack_api_token;
var texts = random_from_array(config.potential_texts);

// some advanced config i left out of the file
var text_file = 'text_avatar.png';
var final_image_path = path.join(__dirname, text_file);
var show_boxes = false; // useful for debugging, otherwise leave it false
var font_size = 110; // default, may be changed

// if it's 2 words, we can make the text a little bigger probably
if (texts.length === 2) {
    font_size = 125;
}

console.log('making:', texts);
console.log('at font size:', font_size);

// font file loading helper function
function fontFile(name) {
    return path.join(__dirname, name);
}

// init our fancy canvas to draw on
var canvas = new Canvas(config.width, config.height);
var ctx = canvas.getContext('2d');

// background, useful for troubleshooting positioning
if (show_boxes) {
    ctx.beginPath();
    ctx.rect(0, 0, config.width, config.height);
    ctx.fillStyle = "#eee";
    ctx.fill();
}

// load our "fake" font
// because ctx.font() won't properly take params like `italic bold` for some reason
var fakeFont = new Font('Fooooont', fontFile(config.which_font_file));
ctx.addFont(fakeFont);
ctx.font = 'normal ' + font_size + 'px Fooooont';

// helper function to render text with a shadow
function renderText(the_text, x, y) {
    // render the text shadow
    ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.fillText(the_text, x + config.shadow_distance, y + config.shadow_distance);

    // render the text
    ctx.fillStyle = '#444';
    ctx.fillText(the_text, x, y);
}

// if we have 2 lines of text, do the rendering differently
if (texts.length === 2) {

    var m1 = ctx.measureText(texts[0]);
    var m2 = ctx.measureText(texts[1]);

    // info about the rendered text
    // console.log(m1)
    // console.log(m2)

    var text1_x = ((config.width - m1.width) * 0.5) - (config.shadow_distance/2);
    var text2_x = ((config.width - m2.width) * 0.5) - (config.shadow_distance/2);
    var text1_y = (config.height + m1.actualBoundingBoxAscent) * 0.333;
    var text2_y = (config.height + m2.actualBoundingBoxAscent) * 0.666; // hail satan

    renderText(texts[0], text1_x, text1_y);
    renderText(texts[1], text2_x, text2_y);

} else if (texts.length === 1) {
    // if we have 1 line of text, do it this way
    var m = ctx.measureText(texts[0]);

    // info about the rendered text
    // console.log(m)

    var text_x = ((config.width - m.width) * 0.5) - (config.shadow_distance/2);
    var text_y = (config.height + m.actualBoundingBoxAscent) * 0.5; // center vertically

    // bounding box behind the text
    if (show_boxes) {
        ctx.beginPath();
        ctx.rect(text_x, text_y - m.actualBoundingBoxAscent, m.width, m.actualBoundingBoxAscent);
        ctx.fillStyle = "#0f0";
        ctx.fill();
    }

    renderText(texts[0], text_x, text_y);
} else {
    throw 'uhhhhh text can either have 1 or 2 lines, sorry';
}

// write out the image file
var png_stream = canvas.createPNGStream();
png_stream.on('end', () => {
    // when the PNG has been saved, let's send it to Slack!
    if (!config.post_to_slack) {
        // or not...
        console.log('not posting to slack, just done saving as "' + text_file + '"');
        return;
    }

    console.log('done making image, now uploading to Slack!');

    /*

    why curl via spawn? i tried using the `https` and `request` libs, but Slack always threw
    some kind of error when using them, so fuck it, curl worked, i'll use it.

    */
    const curl = spawn('curl', [
        '-X', 'POST', // POST request
        '-F', 'image=@' + text_file, // form data with image file
        'https://slack.com/api/users.setPhoto?token=' + slack_api_token, // the slack avatar endpoint
    ]);

    curl.stdout.on('data', (data) => {
        const curl_data = JSON.parse(data);
        // console.log(curl_data);
        if (curl_data && curl_data.ok === true) {
            console.log('everything worked out great!!');
        } else {
            console.error(`curl stdout: ${data}`);
        }
    });

    curl.stderr.on('data', (data) => {
        // console.error(`curl stderr: ${data}`);
    });

    curl.on('close', (code) => {
        if (code != 0) {
            console.log(`crap. curl exited with code ${code}`);
        }
    });
});

// pipe that PNG into the file destination
png_stream.pipe(fs.createWriteStream(final_image_path));
