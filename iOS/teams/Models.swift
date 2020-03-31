import Foundation

public struct DistrictResult: Codable {
    var status: String?
    var data: DistrictResultData
}

public struct DistrictResultData: Codable {
    var pageInfo: PageInfo
    var districts: [District]
}

public struct PageInfo: Codable {
    var totalResults: Int
    var resultsPerPage: Int
}

public struct District: Codable {
    var _id: String
    var name: String
    var altName: String
    var id: String
    var accounts: [String: Account]

    
}

public struct Account: Codable {
    var url: URL?
}
