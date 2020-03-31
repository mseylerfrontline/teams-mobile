import UIKit

public protocol MenuViewControllerDelegate {
    func toggleSideMenu()
    func showWebApp()
    func showSettings()
    func showHelp()
    func settingsCleared()
    func accountSelected()
}

class MenuViewController: UITableViewController {
    let images = [
        UIImage(named: "MenuTeams"),
        UIImage(named: "MenuSettings"),
        UIImage(named: "MenuHelp")
    ]

    let labels = ["TEAMS", "Settings", "Help"]

    var delegate: MenuViewControllerDelegate?

    override func viewDidLoad() {
        title = "TEAMS Mobile"
        tableView.tableFooterView = UIView()
        tableView.separatorInset = UIEdgeInsets.zero
    }

    override func numberOfSections(in tableView: UITableView) -> Int {
        1
    }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        3
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        var cell = tableView.dequeueReusableCell(withIdentifier: "MenuItem")
        if (cell == nil) {
            cell = UITableViewCell()
        }

        let imageView = UIImageView(image: images[indexPath.row])
        imageView.contentMode = .scaleAspectFit
        cell?.contentView.addSubview(imageView)
        imageView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            imageView.leftAnchor.constraint(equalTo: cell!.contentView.leftAnchor, constant: 10),
            imageView.topAnchor.constraint(equalTo: cell!.contentView.topAnchor, constant: 10),
            imageView.heightAnchor.constraint(equalToConstant: 30),
            imageView.widthAnchor.constraint(equalToConstant: 30),
            cell!.contentView.bottomAnchor.constraint(equalTo: imageView.bottomAnchor, constant: 10)
        ])

        let label = UILabel()
        label.text = labels[indexPath.row]
        cell?.contentView.addSubview(label)
        label.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            label.leftAnchor.constraint(equalTo: imageView.rightAnchor, constant: 10),
            label.centerYAnchor.constraint(equalTo: imageView.centerYAnchor)
        ])
        label.sizeToFit()

        return cell!
    }

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        switch indexPath.row {
        case 1:
            delegate?.showSettings()
        case 2:
            delegate?.showHelp()
        default:
            delegate?.showWebApp()
        }

        tableView.deselectRow(at: indexPath, animated: false)
    }
}
