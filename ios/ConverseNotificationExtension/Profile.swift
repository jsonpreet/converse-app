//
//  Profile.swift
//  Converse
//
//  Created by Noe Malzieu on 05/08/2024.
//

import Foundation
import Alamofire

func getProfile(account: String, address: String) async -> Profile? {
  var profileState = getProfilesStore(account: account)?.state
  if let profile = profileState?.profiles?[address] {
    return profile
  }
  
  // If profile is nil, let's refresh it
  try? await refreshProfileFromBackend(account: account, address: address)
  
  profileState = getProfilesStore(account: account)?.state
  if let profile = profileState?.profiles?[address] {
    return profile
  }
  return nil
}

func refreshProfileFromBackend(account: String, address: String) async throws  {
  let apiURI = getApiURI()
  if (apiURI != nil && !apiURI!.isEmpty) {
    let profileURI = "\(apiURI ?? "")/api/profile"
    
    let response = try await withUnsafeThrowingContinuation { continuation in
      AF.request(profileURI, method: .get, parameters: ["address": address]).validate().responseData { response in
        if let data = response.data {
          continuation.resume(returning: data)
          return
        }
        if let err = response.error {
          continuation.resume(throwing: err)
          return
        }
      }
    }
    
    // Create an instance of JSONDecoder
    let decoder = JSONDecoder()
    
    if let socials = try? decoder.decode(ProfileSocials.self, from: response) {
      saveProfileSocials(account: account, address: address, socials: socials)
    }
    
  }
  
}
