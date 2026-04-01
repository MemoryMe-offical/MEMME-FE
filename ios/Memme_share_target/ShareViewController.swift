//
//  ShareViewController.swift
//  Memme_share_target
//

import UIKit
import Social
import UniformTypeIdentifiers

class ShareViewController: SLComposeServiceViewController {

    override func isContentValid() -> Bool {
        return true
    }

    override func didSelectPost() {
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
              let attachments = extensionItem.attachments,
              !attachments.isEmpty else {
            completeRequest()
            return
        }

        handleAttachments(attachments)
    }

    private func handleAttachments(_ attachments: [NSItemProvider]) {
        for provider in attachments {

            // 1) URL 타입 먼저 처리
            if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { item, error in
                    if let error = error {
                        print("URL load error: \(error.localizedDescription)")
                        self.completeRequest()
                        return
                    }

                    if let url = item as? URL {
                        self.saveSharedURL(url.absoluteString)
                    } else if let nsUrl = item as? NSURL, let url = nsUrl as URL? {
                        self.saveSharedURL(url.absoluteString)
                    } else {
                        self.completeRequest()
                    }
                }
                return
            }

            // 2) plain text로 오는 링크도 처리
            if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { item, error in
                    if let error = error {
                        print("Plain text load error: \(error.localizedDescription)")
                        self.completeRequest()
                        return
                    }

                    if let text = item as? String, text.starts(with: "http") {
                        self.saveSharedURL(text)
                    } else if let nsText = item as? NSString {
                        let text = nsText as String
                        if text.starts(with: "http") {
                            self.saveSharedURL(text)
                        } else {
                            self.completeRequest()
                        }
                    } else {
                        self.completeRequest()
                    }
                }
                return
            }
        }

        print("No supported attachment found")
        completeRequest()
    }

    private func saveSharedURL(_ urlString: String) {
        let sharedDefaults = UserDefaults(suiteName: "group.com.memme.share")
        sharedDefaults?.set(urlString, forKey: "sharedURL")
        sharedDefaults?.synchronize()

        print("Saved shared URL: \(urlString)")
        completeRequest()
    }

    private func completeRequest() {
        DispatchQueue.main.async {
            self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        }
    }

    override func configurationItems() -> [Any]! {
        return []
    }
}
