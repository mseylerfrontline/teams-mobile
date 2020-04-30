import UIKit

public struct FAQ {
    let question: String!
    let answer: String!
}


public class HelpViewController: UITableViewController {
    private let faqs = [
        FAQ(question: "Why can't I change my district or account type in the settings page?", answer: "Sometimes if we're having server problems you'll be unable to change your settings for a time. This is normal and you should be able to make changes again when everything is online!"),
        FAQ(question: "I want to let someone else use this app to check their grades. How do I do it?", answer: "If they have the same account type as you (they are also a student or also a parent and are from the same district), simple logout from the \"TEAMS\" page and they will be able to sign in with their credentials. If not, they\'ll need to go to the \"Settings\" page to configure their account type and then sign in."),
        FAQ(question: "I can't access TEAMS. What should I do?", answer: "It's likely TEAMS is simply unavialable due to maintainence. This issue should not persist long - if it does, contact us at http://mobile.ptsteams.com/")
    ]


    private var selectedSection: Int? = nil

    public var delegate: MenuViewControllerDelegate?

    public override func viewDidLoad() {
        super.viewDidLoad()
        title = "Help"

        if #available(iOS 13.0, *) {
            overrideUserInterfaceStyle = .light
        }

        navigationItem.hidesBackButton = true
        let menuIcon = UIImage(named: "Menu Icon")
        navigationItem.leftBarButtonItem = UIBarButtonItem(image: menuIcon, style: .plain, target: self, action: #selector(showSideBar))
        navigationItem.leftBarButtonItem?.tintColor = .black

        tableView.sectionHeaderHeight = 2
        tableView.sectionFooterHeight = 2
    }

    public override func numberOfSections(in tableView: UITableView) -> Int {
        3
    }

    public override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if (section == selectedSection) {
            return 2
        }
        return 1
    }


    public override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        var cell = tableView.dequeueReusableCell(withIdentifier: "FAQCell")
        if (cell == nil) {
            cell = UITableViewCell()
        }

        let faq = faqs[indexPath.section]
        cell?.textLabel?.text = indexPath.row == 0 ? faq.question : faq.answer
        cell?.textLabel?.numberOfLines = 40
        return cell!
    }

    public override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        guard indexPath.row != 2 else {
            return
        }

        if let previousSelection = selectedSection {
            selectedSection = nil
            tableView.deleteRows(at: [IndexPath(row: 1, section: previousSelection)], with: .top)
        }

        let nextIndexPath = IndexPath(row: indexPath.row+1, section: indexPath.section)
        if selectedSection == indexPath.section {
            tableView.deselectRow(at: indexPath, animated: false)
            selectedSection = nil
            tableView.deleteRows(at: [nextIndexPath], with: .top)
        }
        else {
            selectedSection = indexPath.section
            tableView.insertRows(at: [nextIndexPath], with: .top)
        }
    }

    @objc public func showSideBar() {
        delegate?.toggleSideMenu()
    }
}
