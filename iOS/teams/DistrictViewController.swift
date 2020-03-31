import UIKit

public class DistrictViewController: UITableViewController {    
    private var districtResult: DistrictResult?
    private var districts: [District]?
    private var selectedDistrictId: String?
    public var isSettings = false
    public var delegate: MenuViewControllerDelegate?


    public override func viewDidLoad() {
        super.viewDidLoad()
        title = isSettings ? "Settings" : "Select District"

        if isSettings {
            navigationItem.hidesBackButton = true
            let menuIcon = UIImage(named: "Menu Icon")
            navigationItem.leftBarButtonItem = UIBarButtonItem(image: menuIcon, style: .plain, target: self, action: #selector(showSideBar))
            navigationItem.leftBarButtonItem?.tintColor = .black

            selectedDistrictId = UserDefaults.standard.string(forKey: "district_id")
        }
    }


    public override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        NetworkService.getDistricts(onSuccess: gotDistrictResult, onError: gotError)
    }


    private func gotDistrictResult(_ result: DistrictResult) {
        districtResult = result
        districts = districtResult?.data.districts

        DispatchQueue.main.async {
            self.tableView.reloadData()
        }
    }

    private func gotError(_ error: NetworkError) {
        let alertController = UIAlertController(title: "Error", message: "Could not connect to TEAMS - it may be temporarily unavailable for maintainence. You\'ll need to open this page later to access it.", preferredStyle: .actionSheet)
        let clearAction = UIAlertAction(title: "Okay", style: .default, handler: nil)
        alertController.addAction(clearAction)
        present(alertController, animated: true, completion: nil)
    }

    public override func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }

    public override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return districtResult?.data.districts.count ?? 0
    }

    public override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        var cell = tableView.dequeueReusableCell(withIdentifier: "DistrictCell")

        if (cell == nil) {
            cell = UITableViewCell(style: .default, reuseIdentifier: "DistrictCell")
        }

        let district = districts?[indexPath.row]
        let districtName = district!.name ?? "No District"
        cell?.textLabel?.text = districtName

        let isSelected = (isSettings && district?.id == selectedDistrictId)
        if isSelected {
            cell?.backgroundColor = .red
        }

        return cell!
    }

    public override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let district = districts![indexPath.row]
        UserDefaults.standard.set(district.id, forKey: "district_id")
        let accountVC = AccountViewController(district: district)
        accountVC.delegate = delegate
        navigationController?.pushViewController(accountVC, animated: true)
    }

    @objc public func showSideBar() {
        delegate?.toggleSideMenu()
    }
}
