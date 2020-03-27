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
    override func viewDidLoad() {
        let navigationViewController = UINavigationController(rootViewController: DistrictViewController())
        navigationViewController.willMove(toParent: self)
        addChild(navigationViewController)
        navigationViewController.didMove(toParent: self)
        
        view.addSubview(navigationViewController.view)
    }


}

