import Foundation

public struct NetworkError: Error {
    var description: String
}


public class NetworkService {
    public typealias SuccessHandler = (DistrictResult) -> Void
    public typealias ErrorHandler = (NetworkError) -> Void
    public typealias ResponseHandler = (Data?, URLResponse?, Error?) -> Void

    public static func getDistricts(onSuccess: @escaping SuccessHandler, onError: @escaping ErrorHandler) {
        let url = URL(string: "https://qapi.teams360.net/mobile/v1/districts?key=2e66d029544b2d009b1f71936bcdebf0")!
        let task = URLSession.shared.dataTask(with: url, completionHandler: getHandler(onSuccess: onSuccess, onError: onError))
        task.resume()
    }

    public static func getHandler(onSuccess: @escaping SuccessHandler, onError: @escaping ErrorHandler) -> ResponseHandler {
        return { data, response, error -> Void in
            guard error == nil else {
                let networkError = NetworkError(description: error?.localizedDescription ?? "")
                onError(networkError)
                return
            }

            let httpResponse = response as! HTTPURLResponse
            guard httpResponse.statusCode == 200 else {
                let networkError = NetworkError(description: "Failed to load successfully")
                onError(networkError)
                return
            }

            guard data != nil else {
                let networkError = NetworkError(description: "No data was returned")
                onError(networkError)
                return
            }

            do {
                let decoder = JSONDecoder()
                let data = try decoder.decode(DistrictResult.self, from: data!)
                onSuccess(data)
            } catch {
                let networkError = NetworkError(description: error.localizedDescription)
                onError(networkError)
            }

        }
    }
}
