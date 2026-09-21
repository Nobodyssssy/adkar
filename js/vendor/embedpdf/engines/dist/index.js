import { DEFAULT_PDFIUM_WASM_URL, FONT_CDN_URLS, cdnFontConfig, createCdnFontConfig } from "./lib/pdfium/index.js";
import { WebWorkerEngine, WorkerTask } from "./lib/webworker/engine.js";
import { NoopLogger, PdfErrorCode } from "@embedpdf/models";
import { FontCharset } from "@embedpdf/models";
import { B, F, P, a, R, c, b, d, i, r, e } from "./direct-engine-C8xTbxym.js";
import { I, b as b2, c as c2, a as a2 } from "./browser-BKLM0ThC.js";
import { P as P2 } from "./pdf-engine-D9v0RfKe.js";
import { createPdfiumEngine } from "./lib/pdfium/web/worker-engine.js";
const LOG_SOURCE = "WebWorkerEngineRunner";
const LOG_CATEGORY = "Engine";
class EngineRunner {
  /**
   * Create instance of EngineRunnder
   * @param logger - logger instance
   */
  constructor(logger = new NoopLogger()) {
    this.logger = logger;
    this.execute = async (request) => {
      this.logger.debug(LOG_SOURCE, LOG_CATEGORY, "runner start exeucte request");
      if (!this.engine) {
        const error = {
          type: "reject",
          reason: {
            code: PdfErrorCode.NotReady,
            message: "engine has not started yet"
          }
        };
        const response = {
          id: request.id,
          type: "ExecuteResponse",
          data: {
            type: "error",
            value: error
          }
        };
        this.respond(response);
        return;
      }
      const engine = this.engine;
      const { name, args } = request.data;
      if (!engine[name]) {
        const error = {
          type: "reject",
          reason: {
            code: PdfErrorCode.NotSupport,
            message: `engine method ${name} is not supported yet`
          }
        };
        const response = {
          id: request.id,
          type: "ExecuteResponse",
          data: {
            type: "error",
            value: error
          }
        };
        this.respond(response);
        return;
      }
      switch (name) {
        case "isSupport":
          this.handleTask(request.id, engine.isSupport(...args));
          return;
        case "destroy":
          this.handleTask(request.id, engine.destroy(...args));
          return;
        case "openDocumentUrl":
          this.handleTask(request.id, engine.openDocumentUrl(...args));
          return;
        case "openDocumentBuffer":
          this.handleTask(request.id, engine.openDocumentBuffer(...args));
          return;
        case "getDocPermissions":
          this.handleTask(request.id, engine.getDocPermissions(...args));
          return;
        case "getDocUserPermissions":
          this.handleTask(request.id, engine.getDocUserPermissions(...args));
          return;
        case "getMetadata":
          this.handleTask(request.id, engine.getMetadata(...args));
          return;
        case "setMetadata":
          this.handleTask(request.id, engine.setMetadata(...args));
          return;
        case "getBookmarks":
          this.handleTask(request.id, engine.getBookmarks(...args));
          return;
        case "setBookmarks":
          this.handleTask(request.id, engine.setBookmarks(...args));
          return;
        case "deleteBookmarks":
          this.handleTask(request.id, engine.deleteBookmarks(...args));
          return;
        case "getSignatures":
          this.handleTask(request.id, engine.getSignatures(...args));
          return;
        case "renderPage":
          this.handleTask(request.id, engine.renderPage(...args));
          return;
        case "renderPageRect":
          this.handleTask(request.id, engine.renderPageRect(...args));
          return;
        case "renderPageRaw":
          this.handleTask(request.id, engine.renderPageRaw(...args));
          return;
        case "renderPageRectRaw":
          this.handleTask(request.id, engine.renderPageRectRaw(...args));
          return;
        case "renderPageAnnotation":
          this.handleTask(request.id, engine.renderPageAnnotation(...args));
          return;
        case "renderPageAnnotations":
          this.handleTask(request.id, engine.renderPageAnnotations(...args));
          return;
        case "renderPageAnnotationsRaw":
          this.handleTask(request.id, engine.renderPageAnnotationsRaw(...args));
          return;
        case "renderThumbnail":
          this.handleTask(request.id, engine.renderThumbnail(...args));
          return;
        case "getAllAnnotations":
          this.handleTask(request.id, engine.getAllAnnotations(...args));
          return;
        case "getPageAnnotations":
          this.handleTask(request.id, engine.getPageAnnotations(...args));
          return;
        case "getDocumentJavaScriptActions":
          this.handleTask(request.id, engine.getDocumentJavaScriptActions(...args));
          return;
        case "getPageAnnoWidgets":
          this.handleTask(request.id, engine.getPageAnnoWidgets(...args));
          return;
        case "getPageWidgetJavaScriptActions":
          this.handleTask(request.id, engine.getPageWidgetJavaScriptActions(...args));
          return;
        case "createPageAnnotation":
          this.handleTask(request.id, engine.createPageAnnotation(...args));
          return;
        case "updatePageAnnotation":
          this.handleTask(request.id, engine.updatePageAnnotation(...args));
          return;
        case "removePageAnnotation":
          this.handleTask(request.id, engine.removePageAnnotation(...args));
          return;
        case "getPageTextRects":
          this.handleTask(request.id, engine.getPageTextRects(...args));
          return;
        case "searchAllPages":
          this.handleTask(request.id, engine.searchAllPages(...args));
          return;
        case "closeDocument":
          this.handleTask(request.id, engine.closeDocument(...args));
          return;
        case "closeAllDocuments":
          this.handleTask(request.id, engine.closeAllDocuments(...args));
          return;
        case "saveAsCopy":
          this.handleTask(request.id, engine.saveAsCopy(...args));
          return;
        case "getAttachments":
          this.handleTask(request.id, engine.getAttachments(...args));
          return;
        case "addAttachment":
          this.handleTask(request.id, engine.addAttachment(...args));
          return;
        case "removeAttachment":
          this.handleTask(request.id, engine.removeAttachment(...args));
          return;
        case "readAttachmentContent":
          this.handleTask(request.id, engine.readAttachmentContent(...args));
          return;
        case "setFormFieldValue":
          this.handleTask(request.id, engine.setFormFieldValue(...args));
          return;
        case "setFormFieldState":
          this.handleTask(request.id, engine.setFormFieldState(...args));
          return;
        case "renameWidgetField":
          this.handleTask(request.id, engine.renameWidgetField(...args));
          return;
        case "shareWidgetField":
          this.handleTask(request.id, engine.shareWidgetField(...args));
          return;
        case "flattenPage":
          this.handleTask(request.id, engine.flattenPage(...args));
          return;
        case "extractPages":
          this.handleTask(request.id, engine.extractPages(...args));
          return;
        case "createDocument":
          this.handleTask(request.id, engine.createDocument(...args));
          return;
        case "importPages":
          this.handleTask(request.id, engine.importPages(...args));
          return;
        case "deletePage":
          this.handleTask(request.id, engine.deletePage(...args));
          return;
        case "extractText":
          this.handleTask(request.id, engine.extractText(...args));
          return;
        case "redactTextInRects":
          this.handleTask(request.id, engine.redactTextInRects(...args));
          return;
        case "applyRedaction":
          this.handleTask(request.id, engine.applyRedaction(...args));
          return;
        case "applyAllRedactions":
          this.handleTask(request.id, engine.applyAllRedactions(...args));
          return;
        case "flattenAnnotation":
          this.handleTask(request.id, engine.flattenAnnotation(...args));
          return;
        case "exportAnnotationAppearanceAsPdf":
          this.handleTask(request.id, engine.exportAnnotationAppearanceAsPdf(...args));
          return;
        case "exportAnnotationsAppearanceAsPdf":
          this.handleTask(request.id, engine.exportAnnotationsAppearanceAsPdf(...args));
          return;
        case "getTextSlices":
          this.handleTask(request.id, engine.getTextSlices(...args));
          return;
        case "getPageGlyphs":
          this.handleTask(request.id, engine.getPageGlyphs(...args));
          return;
        case "getPageGeometry":
          this.handleTask(request.id, engine.getPageGeometry(...args));
          return;
        case "getPageTextRuns":
          this.handleTask(request.id, engine.getPageTextRuns(...args));
          return;
        case "merge":
          this.handleTask(request.id, engine.merge(...args));
          return;
        case "mergePages":
          this.handleTask(request.id, engine.mergePages(...args));
          return;
        case "preparePrintDocument":
          this.handleTask(request.id, engine.preparePrintDocument(...args));
          return;
        case "setDocumentEncryption":
          this.handleTask(request.id, engine.setDocumentEncryption(...args));
          return;
        case "removeEncryption":
          this.handleTask(request.id, engine.removeEncryption(...args));
          return;
        case "unlockOwnerPermissions":
          this.handleTask(request.id, engine.unlockOwnerPermissions(...args));
          return;
        case "isEncrypted":
          this.handleTask(request.id, engine.isEncrypted(...args));
          return;
        case "isOwnerUnlocked":
          this.handleTask(request.id, engine.isOwnerUnlocked(...args));
          return;
        default:
          const error = {
            type: "reject",
            reason: {
              code: PdfErrorCode.NotSupport,
              message: `engine method ${name} is not supported`
            }
          };
          const response = {
            id: request.id,
            type: "ExecuteResponse",
            data: {
              type: "error",
              value: error
            }
          };
          this.respond(response);
          return;
      }
    };
  }
  /**
   * Listening on post message
   */
  listen() {
    self.onmessage = (evt) => {
      return this.handle(evt);
    };
  }
  /**
   * Handle post message
   */
  handle(evt) {
    this.logger.debug(LOG_SOURCE, LOG_CATEGORY, "webworker receive message event: ", evt.data);
    try {
      const request = evt.data;
      switch (request.type) {
        case "ExecuteRequest":
          this.execute(request);
          break;
      }
    } catch (e2) {
      this.logger.info(
        LOG_SOURCE,
        LOG_CATEGORY,
        "webworker met error when processing message event:",
        e2
      );
    }
  }
  /**
   * Send the ready response when pdf engine is ready
   * @returns
   *
   * @protected
   */
  ready() {
    this.listen();
    this.respond({
      id: "0",
      type: "ReadyResponse"
    });
    this.logger.debug(LOG_SOURCE, LOG_CATEGORY, "runner is ready");
  }
  /**
   * Bind task progress and completion handlers to worker responses.
   */
  handleTask(requestId, task) {
    task.onProgress((progress) => {
      const response = {
        id: requestId,
        type: "ExecuteProgress",
        data: progress
      };
      this.respond(response);
    });
    task.wait(
      (result) => {
        const response = {
          id: requestId,
          type: "ExecuteResponse",
          data: {
            type: "result",
            value: result
          }
        };
        this.respond(response);
      },
      (error) => {
        const response = {
          id: requestId,
          type: "ExecuteResponse",
          data: {
            type: "error",
            value: error
          }
        };
        this.respond(response);
      }
    );
  }
  /**
   * Send back the response
   * @param response - response that needs sent back
   *
   * @protected
   */
  respond(response) {
    this.logger.debug(LOG_SOURCE, LOG_CATEGORY, "runner respond: ", response);
    self.postMessage(response);
  }
}
export {
  B as BitmapFormat,
  DEFAULT_PDFIUM_WASM_URL,
  EngineRunner,
  FONT_CDN_URLS,
  FontCharset,
  F as FontFallbackManager,
  I as ImageConverterError,
  P2 as PdfEngine,
  P as PdfiumErrorCode,
  a as PdfiumNative,
  R as RenderFlag,
  WebWorkerEngine,
  WorkerTask,
  b2 as browserImageDataToBlobConverter,
  cdnFontConfig,
  c as computeFormDrawParams,
  createCdnFontConfig,
  c2 as createHybridImageConverter,
  b as createNodeFontLoader,
  d as createPdfiumDirectEngine,
  createPdfiumEngine as createPdfiumWorkerEngine,
  a2 as createWorkerPoolImageConverter,
  i as isValidCustomKey,
  r as readArrayBuffer,
  e as readString
};
//# sourceMappingURL=index.js.map
