import AppIntents
import Foundation

struct ShowRecentRecordsIntent: AppIntent {
    static var title: LocalizedStringResource = "최근 기록 알려주기"
    static var description = IntentDescription("최근 저장한 내용을 음성으로 알려줍니다.")
    static var openAppWhenRun: Bool = false

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let recentItems = ["장보기", "면접 준비", "정보처리기사 계획"]

        if recentItems.isEmpty {
            return .result(dialog: "최근 저장한 내용이 없어요.")
        }

        let joined = recentItems.prefix(3).joined(separator: ", ")
        return .result(dialog: "최근 기록은 \(joined) 입니다.")
    }
}

struct ShowStudyRecordsIntent: AppIntent {
    static var title: LocalizedStringResource = "공부 기록 알려주기"
    static var description = IntentDescription("공부 카테고리에 저장된 내용을 음성으로 알려줍니다.")
    static var openAppWhenRun: Bool = false

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let studyItems = ["운영체제 정리", "정보처리기사 실기", "네트워크 복습"]

        if studyItems.isEmpty {
            return .result(dialog: "공부 카테고리에 저장된 내용이 없어요.")
        }

        let joined = studyItems.prefix(3).joined(separator: ", ")
        return .result(dialog: "공부 카테고리에는 \(joined) 이 있어요.")
    }
}

struct MEMMEShortcutsProvider: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        return [
            AppShortcut(
                intent: ShowRecentRecordsIntent(),
                phrases: [
                    "\(.applicationName) 최근 기록 알려줘",
                    "\(.applicationName) 최근 저장한 내용 알려줘",
                    "\(.applicationName) 최근 항목 알려줘"
                ],
                shortTitle: "최근 기록",
                systemImageName: "clock.arrow.circlepath"
            ),
            AppShortcut(
                intent: ShowStudyRecordsIntent(),
                phrases: [
                    "\(.applicationName) 공부 기록 알려줘",
                    "\(.applicationName) 공부 카테고리 알려줘",
                    "\(.applicationName) 공부 항목 뭐 있어"
                ],
                shortTitle: "공부 기록",
                systemImageName: "book"
            )
        ]
    }

    static var shortcutTileColor: ShortcutTileColor = .blue
}
