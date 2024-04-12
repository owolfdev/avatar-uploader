## AvatarUploader with Server Actions

### Overview

The `AvatarUploader` component, along with its server-side functions, provides a comprehensive system for managing user avatars within a Next.js application using Supabase as the backend. It enables users to log in, view their current avatar, upload a new image as an avatar, and log out. This system includes real-time UI updates, Supabase integration for data management, and image processing via the `sharp` library for resizing images before upload.

### AvatarUploader Component

#### Functionality

1. **State Management**:

   - `isPending`: Manages the state of asynchronous actions, particularly during the image upload process.
   - `loggingOut`: Indicates whether a logout process is underway.
   - `imageUrl`: Stores the URL of the user's avatar image.
   - `user`: Contains user data fetched from Supabase.

2. **Effects and Lifecycle**:

   - An effect hook triggers upon component mount and whenever `isPending` changes, fetching user details and their avatar URL from Supabase.

3. **User Interaction**:

   - **Image Upload**: Users can upload a new avatar image through a file input. The upload initiates in a suspended transition state to optimize UI responsiveness.
   - **Logging Out**: Users can log out, which triggers an asynchronous request to Supabase to terminate the session.

4. **Rendering**:
   - Displays the user's current avatar if available.
   - Provides a login link if the user is not authenticated.
   - Shows a button to start the image upload and another to log out.

#### Key Components

- **Link from `next/link`**: Used for navigation to the login page if the user is not logged in.
- **Image from `next/image`**: Optimizes image display.

### Server Actions

#### `uploadImageToServer(formData: FormData)`

##### Description

Processes the image upload request:

1. Authenticates the user.
2. Resizes the image to a predefined size using `sharp`.
3. Uploads the resized image to Supabase Storage.
4. Updates the user's profile with the new avatar URL.

##### Error Handling

Catches and logs errors related to user authentication and file upload processes.

#### `resizeImage(file: File): Promise<Buffer>`

##### Description

Converts a file from `FormData` into a `Buffer` and resizes it to a square format (600x600 pixels), changing the format to JPEG.

#### `updateUserProfile(userId: string, avatarUrl: string, supabase: any)`

##### Description

Updates the user's profile in the Supabase database with the new avatar URL.

##### Error Handling

Checks for errors during the profile update and logs them.

#### `logOutFromSupabase()`

##### Description

Logs out the current user by ending the session in Supabase and redirects the user to the login page.

##### Error Handling

Handles errors that might occur during the logout process and logs them, ensuring the user is redirected irrespective of whether the logout was successful.

### Integration with Supabase

- **Authentication**: Uses Supabase's authentication mechanisms to manage user sessions.
- **Storage**: Utilizes Supabase Storage for storing and retrieving user avatars.
- **Realtime Database**: Interacts with the Supabase realtime database for fetching and updating user profiles.

### Usage

This component and its server functions are designed to be used in applications requiring user profile management with image uploads. It is suitable for environments where user experience and efficient data handling are priorities.
