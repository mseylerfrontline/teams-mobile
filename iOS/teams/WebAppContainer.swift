import UIKit
import WebKit

public class WebAppContainer: UIViewController {
    let webView = WKWebView()
    let name: String
    let url: URL

    var delegate: MenuViewControllerDelegate?

    init(name: String, url: URL) {
        self.name = name
        self.url = url

        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    public override func viewDidLoad() {
        super.viewDidLoad()

        title = name

        navigationItem.hidesBackButton = true
        let menuIcon = UIImage(named: "Menu Icon")
        navigationItem.leftBarButtonItem = UIBarButtonItem(image: menuIcon, style: .plain, target: self, action: #selector(showSideBar))
        navigationItem.leftBarButtonItem?.tintColor = .black

        webView.willMove(toSuperview: view)
        view.addSubview(webView)
        webView.didMoveToSuperview()

        webView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.rightAnchor.constraint(equalTo: view.safeAreaLayoutGuide.rightAnchor),
            webView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
            webView.leftAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leftAnchor)
        ])

        let request = URLRequest(url: url)
        webView.load(request)
    }

    @objc public func showSideBar() {
        delegate?.toggleSideMenu()
    }
}
