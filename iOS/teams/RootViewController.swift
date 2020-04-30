//
//  ViewController.swift
//  teams
//
//  Created by Michael Silvoy on 3/26/20.
//  Copyright © 2020 Frontline Education. All rights reserved.
//

import UIKit
import WebKit

class RootViewController: UIViewController {
    var navigationViewController: UINavigationController!
    var isShowingMenu = false
    let menuViewController = MenuViewController()

    override func viewDidLoad() {
        let menuViewController = MenuViewController()
        menuViewController.delegate = self
        let menuNavicationController = UINavigationController(rootViewController: menuViewController)
        menuNavicationController.view.backgroundColor = .white
        menuNavicationController.willMove(toParent: self)
        addChild(menuNavicationController)
        menuNavicationController.didMove(toParent: self)
        view.addSubview(menuNavicationController.view)


        navigationViewController = UINavigationController()
        if #available(iOS 13.0, *) {
            navigationViewController.overrideUserInterfaceStyle = .light
        }

        navigationViewController.view.layer.shadowColor = UIColor.black.cgColor
        navigationViewController.view.layer.shadowOffset = CGSize(width: 0, height: 0)
        navigationViewController.view.layer.shadowRadius = 4
        navigationViewController.view.layer.shadowOpacity = 0.4

        navigationViewController.view.translatesAutoresizingMaskIntoConstraints = false

        navigationViewController.view.backgroundColor = .white
        navigationViewController.willMove(toParent: self)
        addChild(navigationViewController)
        navigationViewController.didMove(toParent: self)
        
        view.addSubview(navigationViewController.view)
        NSLayoutConstraint.activate([
            navigationViewController.view.topAnchor.constraint(equalTo: view.topAnchor),
            navigationViewController.view.rightAnchor.constraint(equalTo: view.safeAreaLayoutGuide.rightAnchor),
            navigationViewController.view.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
            navigationViewController.view.leftAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leftAnchor)
        ])
    }


    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        showContent()
    }

    func showContent() {
        let selectedDistrictName = UserDefaults.standard.string(forKey: "district_name")
        let selectedDistrictURL = UserDefaults.standard.url(forKey: "district_url")

        var rootVC: UIViewController
        if (selectedDistrictName != nil && selectedDistrictURL != nil) {
            let webAppVC = WebAppContainer.init(name: selectedDistrictName!, url: selectedDistrictURL!)
            webAppVC.delegate = self
            rootVC = webAppVC
        }
        else {
            let districtVC = DistrictViewController()
            districtVC.delegate = self
            rootVC = districtVC
        }


        navigationViewController.viewControllers = [rootVC]
    }
}


extension RootViewController: MenuViewControllerDelegate {
    func showWebApp() {
        toggleSideMenu()
        navigationViewController.popToRootViewController(animated: false)
    }

    func showSettings() {
        toggleSideMenu()

        let selectedDistrictName = UserDefaults.standard.string(forKey: "district_name") ?? ""
        let selectedAccountType = UserDefaults.standard.string(forKey: "account_type") ?? ""

        let districtVC = SettingsViewController(districtName: selectedDistrictName, accountName: selectedAccountType)
        districtVC.delegate = self
        navigationViewController.pushViewController(districtVC, animated: false)
    }

    func showHelp() {
        toggleSideMenu()

        let helpVC = HelpViewController(style: .grouped)
        helpVC.delegate = self
        navigationViewController.pushViewController(helpVC, animated: false)
    }

    func toggleSideMenu() {
        var newRect: CGRect
        if isShowingMenu {
            newRect = CGRect.init(origin: .init(x: 0, y: 0), size: navigationViewController.view!.frame.size)
        }
        else {
            let offset = navigationViewController.view.frame.width-50
            newRect = CGRect.init(origin: .init(x: offset, y: 0), size: navigationViewController.view!.frame.size)
        }

        UIView.animate(withDuration: 0.25, delay: 0, options: [.curveEaseOut], animations: {
            self.navigationViewController.view.frame = newRect
        }) { (finished) in
            self.isShowingMenu = !self.isShowingMenu
        }
    }


    func settingsCleared() {
        showContent()
    }

    func accountSelected() {
        showContent()
    }
}

