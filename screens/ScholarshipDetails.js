import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
import { doc, getDoc, getDocs, query, collection, where, orderBy, updateDoc, addDoc } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase/dbConnection';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Navigation from './Navigation';

export default function Profile({ navigation, route }) {
    const { id } = route.params;
    const [user, setUser] = useState(null);
    const [applications, setApplications] = useState([]);
    const [offerDetails, setOfferDetails] = useState([]);
    const [imageUri, setImageUri] = useState(null);
    const [image, setImage] = useState(null);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [updatePic, setUpdatePic] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const userDoc = await getDoc(doc(db, 'students', id));
                setUser(userDoc.data());

                const applicationsList = await getDocs(query(collection(db, 'enrollments'), where('userId', '==', id)));
                setApplications(applicationsList.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                })))

                const offerDetailsArray = [];

                for (const application of applicationsList.docs) {
                    try {
                        const offerDoc = await getDoc(query(doc(db, 'scholarships', application.data().offerId)));
                        
                        const offerGrantor = await getDocs(query(collection(db, 'organization'), where('orgEmail', '==', offerDoc.data().createdBy)));
                        offerGrantor.forEach(grantor => {
                            offerDetailsArray.push({
                                id: offerDoc.id,
                                ...offerDoc.data(),
                                ...grantor.data(),
                                ...application.data(),
                            });
                        })
                        
                    } catch (error) {
                        console.error('Error fetching documents: ', error);
                    }
                }
                
                setLoading(false);
                setOfferDetails(offerDetailsArray);

            } catch (error) {
                console.error('Error fetching data: ', error)
            }
        }

        fetchData();
    }, [id])

    useEffect(() => {
        const fetchProfilePicture = async () => {
            if (!user) return;

            try {
                const imageRef = ref(storage, `${id}/studProfilePictures/${user.profilePicture}`);

                const url = await getDownloadURL(imageRef);
                setImageUri(url);
            } catch (error) {
                console.error('Error: ', error);
            }
        }
        fetchProfilePicture();
    }, [user]);

    const changeProfilePicture = async() => {
        try {
            setUpdatePic(true);
            const { uri } = await FileSystem.getInfoAsync(image);
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = () => {
                        resolve(xhr.response);
                    };
                    xhr.onerror = (e) => {
                        reject(new TypeError('Network request failed'));
                    };
                    xhr.responseType = 'blob';
                    xhr.open('GET', uri, true);
                    xhr.send(null);
                });

                const filename = image.substring(image.lastIndexOf('/') + 1);
                const imageRef = ref(storage, `${id}/studProfilePictures/${filename}`);

                await uploadBytes(imageRef, blob);

                await updateDoc(doc(db, 'students', id), {
                    profilePicture: filename
                });

                const userlog = await addDoc(collection(db, 'logs'), {
                    activity: 'Updated profile picture',
                    userId: id,
                    timestamp: new Date(),
                });

                setImage(null);
                setVisible(false);
                navigation.goBack();
                navigation.navigate('Profile', {id: id});
                setUpdatePic(false);
        } catch(error) {
            console.error('Error updating profile picture: ', error);
        }
    }

    return (
        <View style={styles.container}>
            {user ? (
                <>
                    <View style={styles.header}>
                        <View style={styles.profileContainer}>
                            {imageUri && (
                                <TouchableOpacity onPress={() => setVisible(true)}>
                                    <Image
                                        source={{ uri: imageUri }}
                                        style={styles.profileImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            )
                            }
                            <View style={styles.profileDetails}>
                                <Text style={styles.profileName}>{user.firstname} {user.lastname}</Text>
                                <Text style={styles.profileEmail}>{user.email}</Text>
                                <Text style={styles.profileContact}>{user.username}</Text>
                            </View>
                        </View>
                        <View style={styles.icons}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('History', {id: id})}
                            >
                                <MaterialIcons name="history" size={30} color="#F7D66A" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('EditProfile', { id: id })}
                            >
                                <FontAwesome name="edit" size={30} color="#F7D66A" />
                            </TouchableOpacity>
                        </View>
                    </View>

                </>
            ) : (
                <View style={styles.loading}>
                    <ActivityIndicator
                        size="large"
                        color="#F7D66A"
                    />
                </View>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.changePicture}>
                            {!image ? (
                                <>
                                    <Image
                                        source={{ uri: imageUri }}
                                        style={{ width: 150, height: 150, borderRadius: 100}}
                                        resizeMode="cover"
                                    />
                                    <View></View>
                                    <TouchableOpacity
                                        style={styles.imageUpload}
                                        onPress={pickImage}
                                    >
                                        <AntDesign name="plus" size={24} color="#555455" />
                                        <Text>Upload ID</Text>
                                        
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Image
                                        source={{ uri: image }}
                                        style={{ width: 150, height: 150, borderRadius: 100}}
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity
                                        style={styles.imageUpload}
                                        onPress={pickImage}
                                        >
                                        <AntDesign name="plus" size={24} color="#555455" />
                                        <Text>Select New ID Image</Text>
                                    </TouchableOpacity>
                                    <View style={styles.changePictureButton}>

                                    {!updatePic ? (
                                        <TouchableOpacity
                                            onPress={changeProfilePicture}
                                        >
                                            <Text>Change Picture</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <ActivityIndicator
                                            size="small"
                                            color="#4D4D4D"
                                            />
                                        )}
                                    </View>
                                </>
                            )}
                </View>
            </Modal>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.scholarshipContainer}>
                    {!loading ? (
                        offerDetails.length > 0 ? (
                            offerDetails.map((offer) => (
                                <View key={offer.id} style={styles.scholarshipItem}>
                                    <View style={styles.scholarshipDetails}>
                                        <Text style={styles.institutionName}>{offer.orgName}</Text>
                                        <Text style={styles.scholarshipName}>{offer.programName}</Text>
                                    </View>
                                    <View style={styles.progressContainer}>
                                        {offer.status == 'Approved' ? (
                                            <View style={[styles.progressBarContainer, { backgroundColor: '#4CAF50' }]}>
                                                <Text style={[styles.progressText, {color: 'white'}]}>{offer.status}</Text>
                                            </View>
                                        ) : offer.status == 'Processing' ? (
                                            <View style={[styles.progressBarContainer, { backgroundColor: '#FFA500' }]}>
                                                <Text style={[styles.progressText, { color: 'white' }]}>{offer.status}</Text>
                                            </View>
                                        ) : offer.status == 'Pending' ? (
                                            <View style={[styles.progressBarContainer, { backgroundColor: '#FF4D4D' }]}>
                                                <Text style={[styles.progressText, { color: 'white' }]}>{offer.status}</Text>
                                            </View>
                                        ) : (
                                            <View style={[styles.progressBarContainer, { backgroundColor: '#B0B0B0' }]}>
                                                <Text style={styles.progressText}>{offer.status}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.remarks}>
                                        <Text style={styles.remarksTitle}>Remarks:</Text>
                                        <View style={styles.remarksContainer}>
                                            <Text>{offer.remarks}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View>
                                <Text>No scholarships available.</Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('FilteredOffersList', {id: id})}
                                    style={{ marginTop: 10 }}
                                >
                                    <Text style={styles.apply}>Click here to start applying now.</Text>
                                </TouchableOpacity>
                                
                            </View>
                        )
                        
                    ) : (
                        <View style={styles.loading}>
                            <ActivityIndicator
                                size="large"
                                color="#4D4D4D"
                            />
                        </View>
                    )}
                </View>
            </ScrollView>

            <Navigation navigation={navigation} id={id} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4D4D4D',
    },
    header: {
        padding: 15,
        backgroundColor: '#4D4D4D',
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 60,
        height: 60,
        backgroundColor: '#E6D3A3',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30
    },
    profileDetails: {
        marginLeft: 10,
    },
    detailsContainer: {
        flexDirection: 'row'
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    profileStatus: {
        fontSize: 14,
        color: '#FFD700',
    },
    profileEmail: {
        fontSize: 14,
        color: '#FFFFFF',
    },
    profileContact: {
        fontSize: 14,
        color: '#FFFFFF',
    },
    notificationButton: {
        padding: 10,
    },
    contentContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    scholarshipContainer: {
        backgroundColor: '#E6D3A3',
        borderRadius: 15,
        padding: 15,
        elevation: 10,
    },
    scholarshipItem: {
        backgroundColor: '#4D4D4D',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        elevation: 10,
    },
    scholarshipDetails: {
        flex: 1,
    },
    institutionName: {
        fontSize: 16,
        color: '#FFD700'
    },
    scholarshipName: {
        fontSize: 14,
        color: '#CCCCCC'
    },
    progressContainer: {
        marginTop: 10,
    },
    progressText: {
        fontSize: 14,
    },
    progressBarContainer: {
        borderRadius: 5,
        overflow: 'hidden',
        marginTop: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },

    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    nav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 15,
        marginLeft: 20,
        marginRight: 20,
        borderTopWidth: 1,
        borderTopColor: 'gray',
        borderTopStyle: 'solid'
    },
    apply: {
        fontSize: 16,
        fontWeight: 'bold',
        fontStyle: 'italic',
        textDecorationLine: 'underline',
    },
    changePicture: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageUpload: {
        flexDirection: 'row',
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 20,
        backgroundColor: '#FADEAD',
        elevation: 5
    },
    changePictureButton: {
        marginTop: 10,
        padding: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FADEAD',
        borderRadius: 20,
        elevation: 5
    },
    icons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 80,
    },
    remarks: {
        marginTop: 10
    },
    remarksTitle: {
        color: '#CCCCCC'
    },
    remarksContainer: {
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 10,
    }
});