const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const path = require('path');
const fs = require('fs');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Make sure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

async function convertWebMtoMP4(webmBuffer) {
    const timestamp = Date.now();
    const inputPath = path.join(tempDir, `input_${timestamp}.webm`);
    const outputPath = path.join(tempDir, `output_${timestamp}.mp4`);

    // Write incoming WebM to temp file
    await fs.promises.writeFile(inputPath, webmBuffer);

    // Convert to MP4
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat('mp4')
            .outputOptions([
                '-c:v libx264',    // Use H.264 codec
                '-crf 23',         // Quality setting (lower = better quality, 23 is default)
                '-preset fast'      // Encoding speed preset
            ])
            .on('end', () => {
                // Read the output file
                fs.readFile(outputPath, (err, data) => {
                    // Clean up temp files
                    fs.unlink(inputPath, () => {});
                    fs.unlink(outputPath, () => {});

                    if (err) reject(err);
                    else resolve(data);
                });
            })
            .on('error', (err) => {
                // Clean up temp files
                fs.unlink(inputPath, () => {});
                fs.unlink(outputPath, () => {});
                reject(err);
            })
            .save(outputPath);
    });
}

module.exports = {
    convertWebMtoMP4
};