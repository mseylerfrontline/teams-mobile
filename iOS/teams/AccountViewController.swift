import UIKit

public class AccountViewController: UITableViewController {
    let district: District
    let accounts: [[String: URL?]]

    init(district: District) {
        self.district = district

        accounts = self.district.accounts.compactMap({ (arg0) -> [String: URL?] in
            let (name, account) = arg0
            return [name: account.url]
        })

        super.init(style: .plain)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    public override func viewDidLoad() {
        super.viewDidLoad()
        title = "Select Account"

        navigationItem.rightBarButtonItem = UIBarButtonItem.init(title: "Select", style: .plain, target: self, action: #selector(go))
        navigationItem.rightBarButtonItem?.isEnabled = false
    }

    public override func numberOfSections(in tableView: UITableView) -> Int {
        1
    }

    @objc public func go() {
        let selectedRowIndexPath = tableView.indexPathForSelectedRow!
        let (_, url) = accounts[selectedRowIndexPath.row].first!
        let webAppVC = WebAppContainer(name: district.name, url: url!)
        navigationController?.pushViewController(webAppVC, animated: true)
        
    }

    public override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        print(accounts.count)
        return accounts.count
    }

    public override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        var cell = tableView.dequeueReusableCell(withIdentifier: "AccountCell")

        if (cell == nil) {
            cell = UITableViewCell(style: .default, reuseIdentifier: "AccountCell")
        }

        let (name, _) = accounts[indexPath.row].first!
        cell?.textLabel?.text = name
        return cell!
    }


    public override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        navigationItem.rightBarButtonItem?.isEnabled = true
    }
}
