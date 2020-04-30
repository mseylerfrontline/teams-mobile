import UIKit

public class SettingsViewController: UITableViewController {
    let labels = ["District", "Account Type"]
    var detailLabels = [String]()
    let button = UIButton()


    public var delegate: MenuViewControllerDelegate?

    public init(districtName: String, accountName: String) {
        super.init(style: .grouped)

        title = "Settings"

        detailLabels.append(districtName)
        detailLabels.append(accountName)
    }

    public override func viewDidLoad() {
        super.viewDidLoad()

        if #available(iOS 13.0, *) {
            overrideUserInterfaceStyle = .light
        }

        navigationItem.hidesBackButton = true
        let menuIcon = UIImage(named: "Menu Icon")
        navigationItem.leftBarButtonItem = UIBarButtonItem(image: menuIcon, style: .plain, target: self, action: #selector(showSideBar))
        navigationItem.leftBarButtonItem?.tintColor = .black


        let footerView = UIView(frame: CGRect(x: 0, y: 0, width: tableView.frame.width, height: 80))

        button.backgroundColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.02)
        button.setTitleColor(.black, for: .normal)
        button.setTitle("Clear Data", for: .normal)
        button.layer.borderColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.1).cgColor
        button.layer.borderWidth = 1
        button.addTarget(self, action: #selector(confirmClearData), for: .touchUpInside)
        button.sizeToFit()
        button.translatesAutoresizingMaskIntoConstraints = false
        footerView.addSubview(button)
        NSLayoutConstraint.activate([
            button.topAnchor.constraint(equalTo: footerView.topAnchor, constant: 20),
            button.centerXAnchor.constraint(equalTo: footerView.centerXAnchor),
            button.widthAnchor.constraint(equalTo: footerView.widthAnchor, multiplier: 0.7),
            button.heightAnchor.constraint(equalToConstant: 40),
            button.centerYAnchor.constraint(equalTo: footerView.centerYAnchor)
        ])

        tableView.tableFooterView = footerView

        tableView.allowsSelection = false
        tableView.sectionHeaderHeight = 5
        tableView.sectionFooterHeight = 5
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    public override func numberOfSections(in tableView: UITableView) -> Int {
        2
    }

    public override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        1
    }

    public override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        var cell = tableView.dequeueReusableCell(withIdentifier: "SettingsCell")
        if (cell == nil) {
            cell = UITableViewCell(style: .value1, reuseIdentifier: "SettingsCell")
        }

        cell?.detailTextLabel?.textColor = .darkGray

        cell?.textLabel?.text = labels[indexPath.section]
        cell?.detailTextLabel?.text = detailLabels[indexPath.section]

        return cell!
    }

    @objc public func showSideBar() {
        delegate?.toggleSideMenu()
    }

    @objc func confirmClearData() {
        let alertController = UIAlertController(title: "Confirm", message: "Clear all of the data associated with this app? You'll need to redo your settings.", preferredStyle: .actionSheet)
        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel, handler: nil)
        let clearAction = UIAlertAction(title: "Okay", style: .destructive, handler: {
            (action) in

            UserDefaults.standard.removeObject(forKey: "district_id")
            UserDefaults.standard.removeObject(forKey: "district_name")
            UserDefaults.standard.removeObject(forKey: "district_url")

            self.delegate?.settingsCleared()
        })

        alertController.addAction(cancelAction)
        alertController.addAction(clearAction)
        present(alertController, animated: true, completion: nil)
    }
}
