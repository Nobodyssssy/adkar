function rgbaToBmpBlob(rgba, width, height) {
  const pixels = width * height * 4;
  const headerLength = 66;
  const le32 = (v) => [v & 255, v >>> 8 & 255, v >>> 16 & 255, v >>> 24 & 255];
  const header = new Uint8Array([
    66,
    77,
    // 'BM' signature
    ...le32(headerLength + pixels),
    // file size
    0,
    0,
    0,
    0,
    // reserved
    headerLength,
    0,
    0,
    0,
    // pixel data offset
    40,
    0,
    0,
    0,
    // DIB header size
    ...le32(width),
    // width
    ...le32(-height),
    // height (negative = top-down)
    1,
    0,
    // color planes
    32,
    0,
    // bits per pixel
    3,
    0,
    0,
    0,
    // compression = BI_BITFIELDS
    ...le32(pixels),
    // image data size
    0,
    0,
    0,
    0,
    // h resolution
    0,
    0,
    0,
    0,
    // v resolution
    0,
    0,
    0,
    0,
    // colors in palette
    0,
    0,
    0,
    0,
    // important colors
    255,
    0,
    0,
    0,
    // R channel mask
    0,
    255,
    0,
    0,
    // G channel mask
    0,
    0,
    255,
    0
    // B channel mask
  ]);
  return new Blob(
    [header, new Uint8Array(rgba.buffer, rgba.byteOffset, rgba.byteLength)],
    { type: "image/bmp" }
  );
}
class ImageConverterError extends Error {
  constructor(message) {
    super(message);
    this.name = "ImageConverterError";
  }
}
const browserImageDataToBlobConverter = (getImageData, imageType = "image/png", quality) => {
  const pdfImage = getImageData();
  if (imageType === "image/bmp") {
    return Promise.resolve(rgbaToBmpBlob(pdfImage.data, pdfImage.width, pdfImage.height));
  }
  if (typeof document === "undefined") {
    return Promise.reject(
      new ImageConverterError(
        "document is not available. This converter requires a browser environment."
      )
    );
  }
  const imageData = new ImageData(pdfImage.data, pdfImage.width, pdfImage.height);
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    canvas.getContext("2d").putImageData(imageData, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new ImageConverterError("Canvas toBlob returned null"));
        }
      },
      imageType,
      quality
    );
  });
};
function createWorkerPoolImageConverter(workerPool) {
  const converter = (getImageData, imageType = "image/png", quality) => {
    const pdfImage = getImageData();
    if (imageType === "image/bmp") {
      return Promise.resolve(rgbaToBmpBlob(pdfImage.data, pdfImage.width, pdfImage.height));
    }
    const dataCopy = new Uint8ClampedArray(pdfImage.data);
    return workerPool.encode(
      {
        data: dataCopy,
        width: pdfImage.width,
        height: pdfImage.height
      },
      imageType,
      quality
    );
  };
  converter.destroy = () => workerPool.destroy();
  return converter;
}
function createHybridImageConverter(workerPool) {
  const converter = async (getImageData, imageType = "image/png", quality) => {
    const pdfImage = getImageData();
    if (imageType === "image/bmp") {
      return rgbaToBmpBlob(pdfImage.data, pdfImage.width, pdfImage.height);
    }
    try {
      const dataCopy = new Uint8ClampedArray(pdfImage.data);
      return await workerPool.encode(
        {
          data: dataCopy,
          width: pdfImage.width,
          height: pdfImage.height
        },
        imageType,
        quality
      );
    } catch (error) {
      console.warn("Worker encoding failed, falling back to main-thread Canvas:", error);
      return browserImageDataToBlobConverter(getImageData, imageType, quality);
    }
  };
  converter.destroy = () => workerPool.destroy();
  return converter;
}
export {
  ImageConverterError as I,
  createWorkerPoolImageConverter as a,
  browserImageDataToBlobConverter as b,
  createHybridImageConverter as c
};
//# sourceMappingURL=browser-BKLM0ThC.js.map
