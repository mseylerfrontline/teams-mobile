import UIKit

public class DistrictViewController: UITableViewController {    
    private var districtResult: DistrictResult?
    private var districts: [District]?

    public override func viewDidLoad() {
        super.viewDidLoad()
        title = "Select District"
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
        print("Error", error)
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

        let district = districts?[indexPath.row].name ?? "No District"
        cell?.textLabel?.text = district

        return cell!
    }

    public override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let district = districts![indexPath.row]
        let accountVC = AccountViewController(district: district)
        navigationController?.pushViewController(accountVC, animated: true)
    }
}
