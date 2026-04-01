import Foundation
import React

@objc(SharedDefaultsModule)
class SharedDefaultsModule: NSObject {

  @objc
  func getSharedURL(_ resolve: RCTPromiseResolveBlock,
                    rejecter reject: RCTPromiseRejectBlock) {
    let sharedDefaults = UserDefaults(suiteName: "group.com.memme.share")
    let value = sharedDefaults?.string(forKey: "sharedURL")
    print("🔥 Swift에서 읽은 값:", value ?? "nil")
    resolve(value)
  }

  @objc
  func clearSharedURL(_ resolve: RCTPromiseResolveBlock,
                      rejecter reject: RCTPromiseRejectBlock) {
    let sharedDefaults = UserDefaults(suiteName: "group.com.memme.share")
    sharedDefaults?.set("", forKey: "sharedURL")
    resolve(true)
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}